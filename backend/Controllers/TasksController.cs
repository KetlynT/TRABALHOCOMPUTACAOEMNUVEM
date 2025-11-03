using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Domain;
using ProjectManagement.Api.DTOs;
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
        private readonly ProjectAccessService _accessService;

        public TasksController(AppDbContext context, ActivityService activityService, ProjectAccessService accessService)
        {
            _context = context;
            _activityService = activityService;
            _accessService = accessService;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        
        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetTask(Guid taskId)
        {
            var projectId = await _accessService.GetProjectIdFromTask(taskId);
            if (!await _accessService.CanAccessProject(GetUserId(), projectId))
            {
                return Forbid();
            }

            var task = await _context.Tasks
                .Include(t => t.Assignee)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null) return NotFound();
            
            return Ok(new 
            {
                task.Id,
                task.Title,
                task.Description,
                task.DueDate,
                task.BoardId,
                AssigneeName = task.Assignee?.FullName
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskItem taskDto)
        {
            var projectId = await _accessService.GetProjectIdFromBoard(taskDto.BoardId);
            if (!await _accessService.CanAccessProject(GetUserId(), projectId))
            {
                return Forbid();
            }
            
            var board = await _context.Boards.FindAsync(taskDto.BoardId);
            if (board == null) return BadRequest("Quadro (Board) não encontrado.");

            var position = await _context.Tasks.CountAsync(t => t.BoardId == taskDto.BoardId);

            var task = new TaskItem
            {
                Title = taskDto.Title,
                Description = taskDto.Description,
                BoardId = taskDto.BoardId,
                AssigneeId = taskDto.AssigneeId,
                DueDate = taskDto.DueDate,
                Position = position
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();
            
            await _activityService.LogActivityAsync($"Tarefa '{task.Title}' foi criada.", GetUserId(), projectId, task.Id);

            return Ok(task);
        }

        [HttpPut("{taskId}")]
        public async Task<IActionResult> UpdateTask(Guid taskId, [FromBody] TaskUpdateDto taskDto)
        {
            var projectId = await _accessService.GetProjectIdFromTask(taskId);
            if (!await _accessService.CanAccessProject(GetUserId(), projectId))
            {
                return Forbid();
            }

            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null) return NotFound("Tarefa não encontrada.");

            task.Title = taskDto.Title ?? task.Title;
            task.Description = taskDto.Description;
            task.DueDate = taskDto.DueDate;
            task.AssigneeId = taskDto.AssigneeId;
            
            await _context.SaveChangesAsync();
            await _activityService.LogActivityAsync($"Tarefa '{task.Title}' foi atualizada.", GetUserId(), projectId, task.Id);

            return Ok(task);
        }

        [HttpPost("{taskId}/comments")]
        public async Task<IActionResult> AddComment(Guid taskId, [FromBody] Comment commentDto)
        {
            var projectId = await _accessService.GetProjectIdFromTask(taskId);
            if (!await _accessService.CanAccessProject(GetUserId(), projectId))
            {
                return Forbid();
            }

            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null) return NotFound("Tarefa não encontrada.");

            var comment = new Comment
            {
                Content = commentDto.Content,
                TaskItemId = taskId,
                AuthorId = GetUserId()
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            await _activityService.LogActivityAsync($"Novo comentário em '{task.Title}'.", GetUserId(), projectId, task.Id);

            return Ok(comment);
        }
        
        [HttpGet("{taskId}/comments")]
        public async Task<IActionResult> GetComments(Guid taskId)
        {
            var projectId = await _accessService.GetProjectIdFromTask(taskId);
            if (!await _accessService.CanAccessProject(GetUserId(), projectId))
            {
                return Forbid();
            }

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
        
        [HttpPost("reorder")]
        public async Task<IActionResult> ReorderTasks([FromBody] TaskReorderDto reorderDto)
        {
            var projectId = await _accessService.GetProjectIdFromTask(reorderDto.TaskId);
            if (!await _accessService.CanAccessProject(GetUserId(), projectId))
            {
                return Forbid();
            }
            
            // Verifique se o quadro de destino também está no projeto
            var destProjectId = await _accessService.GetProjectIdFromBoard(reorderDto.DestinationBoardId);
            if(projectId != destProjectId)
            {
                return BadRequest("Não é possível mover tarefas entre projetos.");
            }

            var task = await _context.Tasks.FindAsync(reorderDto.TaskId);
            if (task == null) return NotFound("Tarefa não encontrada.");

            var sourceBoardId = reorderDto.SourceBoardId;
            var destBoardId = reorderDto.DestinationBoardId;
            var destIndex = reorderDto.DestinationIndex;

            var sourceTasks = await _context.Tasks
                .Where(t => t.BoardId == sourceBoardId)
                .OrderBy(t => t.Position)
                .ToListAsync();

            sourceTasks.Remove(task);

            if (sourceBoardId == destBoardId)
            {
                sourceTasks.Insert(destIndex, task);
                ReindexTasks(sourceTasks);
            }
            else
            {
                task.BoardId = destBoardId;
                var destTasks = await _context.Tasks
                    .Where(t => t.BoardId == destBoardId)
                    .OrderBy(t => t.Position)
                    .ToListAsync();
                
                destTasks.Insert(destIndex, task);
                
                ReindexTasks(sourceTasks);
                ReindexTasks(destTasks);
            }

            await _context.SaveChangesAsync();
            
            var board = await _context.Boards.FindAsync(destBoardId);
            await _activityService.LogActivityAsync($"Tarefa '{task.Title}' movida para '{board?.Name}'.", GetUserId(), projectId, task.Id);

            return Ok();
        }

        private void ReindexTasks(List<TaskItem> tasks)
        {
            for (int i = 0; i < tasks.Count; i++)
            {
                tasks[i].Position = i;
            }
        }
    }
}