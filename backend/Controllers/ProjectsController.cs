using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
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

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] Project projectDto)
        {
            var userId = GetUserId();
            
            var project = new Project
            {
                Name = projectDto.Name,
                Description = projectDto.Description,
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