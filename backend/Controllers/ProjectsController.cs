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

        private string GenerateNewInviteCode()
        {
            var chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

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
                .Include(p => p.Owner)
                .Include(p => p.Boards.OrderBy(b => b.Position))
                    .ThenInclude(b => b.Tasks.OrderBy(t => t.Position))
                .Include(p => p.Members)
                    .ThenInclude(m => m.User)
                .Select(p => new 
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Boards,
                    p.InviteCode,
                    CreatorId = p.OwnerId,
                    CreatorName = p.Owner != null ? p.Owner.FullName : "Dono Desconhecido",
                    IsAdmin = (p.OwnerId == userId) || p.Members.Any(m => m.UserId == userId && m.IsAdmin),
                    Members = p.Members.Select(m => new { m.UserId, m.User.FullName, m.IsAdmin })
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
                OwnerId = userId,
                InviteCode = GenerateNewInviteCode()
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
            if (!await _accessService.IsProjectAdmin(userId, id))
            {
                return Forbid("Apenas administradores do projeto podem gerar um código.");
            }
            
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound();
            
            project.InviteCode = GenerateNewInviteCode();
            await _context.SaveChangesAsync();

            return Ok(new { inviteCode = project.InviteCode });
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
                UserId = userId,
                IsAdmin = false
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            var userId = GetUserId();
            if (!await _accessService.IsProjectAdmin(userId, id))
            {
                return Forbid("Apenas administradores do projeto podem excluí-lo.");
            }

            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound("Projeto não encontrado.");
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Projeto excluído com sucesso." });
        }

        [HttpPost("{projectId}/promote/{userId}")]
        public async Task<IActionResult> PromoteMember(Guid projectId, string userId)
        {
            var currentUserId = GetUserId();
            if (!await _accessService.IsProjectAdmin(currentUserId, projectId))
            {
                return Forbid("Apenas administradores podem promover outros usuários.");
            }

            if (currentUserId == userId)
            {
                return BadRequest("Você não pode alterar seu próprio status.");
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project.OwnerId == userId)
            {
                return BadRequest("O criador do projeto já é um administrador e não pode ser alterado.");
            }

            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == userId);

            if (member == null)
            {
                return NotFound("Membro não encontrado no projeto.");
            }

            member.IsAdmin = true;
            await _context.SaveChangesAsync();
            
            var promotedUser = await _userManager.FindByIdAsync(userId);
            await _activityService.LogActivityAsync($"'{promotedUser?.FullName}' foi promovido a administrador.", currentUserId, projectId);

            return Ok(new { message = "Usuário promovido a administrador." });
        }

        [HttpPost("{projectId}/demote/{userId}")]
        public async Task<IActionResult> DemoteMember(Guid projectId, string userId)
        {
            var currentUserId = GetUserId();
            if (!await _accessService.IsProjectAdmin(currentUserId, projectId))
            {
                return Forbid("Apenas administradores podem rebaixar outros usuários.");
            }

            if (currentUserId == userId)
            {
                return BadRequest("Você não pode alterar seu próprio status.");
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project.OwnerId == userId)
            {
                return BadRequest("O criador do projeto não pode ser rebaixado.");
            }

            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == userId);

            if (member == null)
            {
                return NotFound("Membro não encontrado no projeto.");
            }

            member.IsAdmin = false;
            await _context.SaveChangesAsync();
            
            var demotedUser = await _userManager.FindByIdAsync(userId);
            await _activityService.LogActivityAsync($"'{demotedUser?.FullName}' foi rebaixado para membro.", currentUserId, projectId);

            return Ok(new { message = "Usuário rebaixado a membro." });
        }
    }
}