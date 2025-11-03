using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Domain;
using ProjectManagement.Api.Services;
using ProjectManagement.Api.DTOs; // <- Adicionado
using System.Security.Claims;

namespace ProjectManagement.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ActivityService _activityService;

        public ProjectsController(AppDbContext context, UserManager<ApplicationUser> userManager, ActivityService activityService)
        {
            _context = context;
            _userManager = userManager;
            _activityService = activityService;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet]
        public async Task<IActionResult> GetMyProjects()
        {
            var userId = GetUserId();
            var projects = await _context.Projects
                .Where(p => p.OwnerId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProject(Guid id)
        {
            var userId = GetUserId();
            var project = await _context.Projects
                .Include(p => p.Boards.OrderBy(b => b.Position))
                .ThenInclude(b => b.Tasks.OrderBy(t => t.Position))
                .FirstOrDefaultAsync(p => p.Id == id && p.OwnerId == userId);

            if (project == null)
            {
                return NotFound();
            }
            return Ok(project);
        }
        
        [HttpGet("{id}/activity")]
        public async Task<IActionResult> GetProjectActivity(Guid id)
        {
            var userId = GetUserId();
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == id && p.OwnerId == userId);
            if (!projectExists)
            {
                return NotFound("Projeto não encontrado.");
            }

            var activities = await _context.ActivityLogs
                .Where(a => a.ProjectId == id)
                .Include(a => a.User)
                .OrderByDescending(a => a.Timestamp)
                .Select(a => new 
                {
                    a.Id,
                    a.Description,
                    a.Timestamp,
                    UserName = a.User != null ? a.User.FullName : "Usuário"
                })
                .ToListAsync();
            
            return Ok(activities);
        }

        [HttpPost]
        // *** ESTA É A CORREÇÃO ***
        // Alterado de [FromBody] Project projectDto para [FromBody] ProjectCreateDto dto
        public async Task<IActionResult> CreateProject([FromBody] ProjectCreateDto dto)
        {
            var userId = GetUserId();
            
            var project = new Project
            {
                // Usando o DTO
                Name = dto.Name,
                Description = dto.Description,
                OwnerId = userId
            };

            project.Boards.Add(new Board { Name = "A Fazer", Position = 0 });
            project.Boards.Add(new Board { Name = "Em Andamento", Position = 1 });
            project.Boards.Add(new Board { Name = "Concluído", Position = 2 });
            
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            
            await _activityService.LogActivityAsync($"Projeto '{project.Name}' foi criado.", userId, project.Id);

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }
    }
}