using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Domain;
using ProjectManagement.Api.Services;
using ProjectManagement.Api.DTOs;
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
        private readonly ProjectAccessService _accessService;

        public ProjectsController(AppDbContext context, 
                                  UserManager<ApplicationUser> userManager, 
                                  ActivityService activityService, 
                                  ProjectAccessService accessService)
        {
            _context = context;
            _userManager = userManager;
            _activityService = activityService;
            _accessService = accessService;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet]
        public async Task<IActionResult> GetMyProjects()
        {
            var userId = GetUserId();
            var projects = await _context.Projects
                .Where(p => p.OwnerId == userId || p.Members.Any(m => m.UserId == userId))
                .Select(p => new 
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.CreatedAt,
                    IsOwner = p.OwnerId == userId
                })
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
            
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProject(Guid id)
        {
            var userId = GetUserId();
            if (!await _accessService.CanAccessProject(userId, id))
            {
                return Forbid();
            }

            var project = await _context.Projects
                .Include(p => p.Boards.OrderBy(b => b.Position))
                .ThenInclude(b => b.Tasks.OrderBy(t => t.Position))
                .Select(p => new 
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Boards,
                    p.InviteCode,
                    IsOwner = p.OwnerId == userId
                })
                .FirstOrDefaultAsync(p => p.Id == id);

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
            if (!await _accessService.CanAccessProject(userId, id))
            {
                return Forbid();
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
        public async Task<IActionResult> CreateProject([FromBody] ProjectCreateDto dto)
        {
            var userId = GetUserId();
            
            var project = new Project
            {
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

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, new 
            {
                project.Id,
                project.Name,
                project.Description,
                project.CreatedAt,
                IsOwner = true
            });
        }

        [HttpPost("{id}/generate-invite-code")]
        public async Task<IActionResult> GenerateInviteCode(Guid id)
        {
            var userId = GetUserId();
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.OwnerId == userId);
            
            if (project == null)
            {
                return Forbid("Apenas o dono do projeto pode gerar um código.");
            }
            
            // Gera um código alfanumérico simples de 8 dígitos
            var chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
            var random = new Random();
            var code = new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            project.InviteCode = code;
            await _context.SaveChangesAsync();

            return Ok(new { inviteCode = code });
        }

        [HttpPost("join")]
        public async Task<IActionResult> JoinProject([FromBody] ProjectJoinDto dto)
        {
            var userId = GetUserId();
            var project = await _context.Projects
                .Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.InviteCode == dto.InviteCode);

            if (project == null)
            {
                return NotFound(new { Message = "Código de convite inválido." });
            }

            if (project.OwnerId == userId || project.Members.Any(m => m.UserId == userId))
            {
                return BadRequest(new { Message = "Você já participa deste projeto." });
            }

            var member = new ProjectMember
            {
                ProjectId = project.Id,
                UserId = userId
            };

            _context.ProjectMembers.Add(member);
            await _context.SaveChangesAsync();
            
            var user = await _userManager.FindByIdAsync(userId);
            await _activityService.LogActivityAsync($"'{user?.FullName ?? "Novo usuário"}' entrou no projeto.", userId, project.Id);

            return Ok(new 
            {
                project.Id,
                project.Name,
                project.Description,
                project.CreatedAt,
                IsOwner = false
            });
        }
    }
}