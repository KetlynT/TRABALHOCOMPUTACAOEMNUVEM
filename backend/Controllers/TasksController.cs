using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Domain;
using ProjectManagement.Api.Services;
using System.Security.Claims;

namespace ProjectManagement.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ActivityService _activityService;

        public TasksController(AppDbContext context, ActivityService activityService)
        {
            _context = context;
            _activityService = activityService;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        
        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskItem taskDto)
        {
            var board = await _context.Boards.FindAsync(taskDto.BoardId);
            if (board == null)
            {
                return BadRequest("Quadro (Board) não encontrado.");
            }

            var task = new TaskItem
            {
                Title = taskDto.Title,
                Description = taskDto.Description,
                BoardId = taskDto.BoardId,
                AssigneeId = taskDto.AssigneeId,
                DueDate = taskDto.DueDate,
                Position = (await _context.Tasks.CountAsync(t => t.BoardId == taskDto.BoardId)) + 1
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();
            
            var project = await _context.Boards
                .Where(b => b.Id == task.BoardId)
                .Select(b => b.Project)
                .FirstOrDefaultAsync();
            
            await _activityService.LogActivityAsync($"Tarefa '{task.Title}' foi criada.", GetUserId(), project?.Id, task.Id);

            return Ok(task);
        }

        [HttpPost("{taskId}/comments")]
        public async Task<IActionResult> AddComment(Guid taskId, [FromBody] Comment commentDto)
        {
            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null)
            {
                return NotFound("Tarefa não encontrada.");
            }

            var comment = new Comment
            {
                Content = commentDto.Content,
                TaskItemId = taskId,
                AuthorId = GetUserId()
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            
            var project = await _context.Tasks
                .Where(t => t.Id == taskId)
                .Select(t => t.Board!.Project) 
                .FirstOrDefaultAsync(); 
            await _activityService.LogActivityAsync($"Novo comentário em '{task.Title}'.", GetUserId(), project?.Id, task.Id);

            return Ok(comment);
        }
        
        [HttpGet("{taskId}/comments")]
        public async Task<IActionResult> GetComments(Guid taskId)
        {
            var comments = await _context.Comments
                .Where(c => c.TaskItemId == taskId)
                .Include(c => c.Author) 
                .OrderBy(c => c.CreatedAt)
                .Select(c => new 
                {
                    c.Id,
                    c.Content,
                    c.CreatedAt,
                    AuthorName = c.Author != null ? c.Author.FullName : "Usuário"
                })
                .ToListAsync();

            return Ok(comments);
        }
        
        [HttpPut("{taskId}/move/{newBoardId}")]
        public async Task<IActionResult> MoveTask(Guid taskId, Guid newBoardId)
        {
             var task = await _context.Tasks.FindAsync(taskId);
             if (task == null) return NotFound("Tarefa não encontrada.");
             
             var board = await _context.Boards.FindAsync(newBoardId);
             if (board == null) return BadRequest("Quadro de destino não encontrado.");
             
             var oldBoardId = task.BoardId;
             task.BoardId = newBoardId;
             
             await _context.SaveChangesAsync();
             
             var project = await _context.Boards.Where(b => b.Id == newBoardId).Select(b => b.Project).FirstOrDefaultAsync();
             await _activityService.LogActivityAsync($"Tarefa '{task.Title}' movida para '{board.Name}'.", GetUserId(), project?.Id, task.Id);

             return Ok(task);
        }
    }
}