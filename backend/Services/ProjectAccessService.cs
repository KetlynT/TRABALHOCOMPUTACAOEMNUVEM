using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectManagement.Api.Services
{
    public class ProjectAccessService
    {
        private readonly AppDbContext _context;

        public ProjectAccessService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CanAccessProject(string userId, Guid projectId)
        {
            var project = await _context.Projects
                .Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null) return false;
            if (project.OwnerId == userId) return true;

            return project.Members.Any(m => m.UserId == userId);
        }

        public async Task<bool> IsProjectAdmin(string userId, Guid projectId)
        {
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null) return false;
            
            if (project.OwnerId == userId) return true;

            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == userId);

            return member != null && member.IsAdmin;
        }

        public async Task<Guid> GetProjectIdFromTask(Guid taskId)
        {
            var task = await _context.Tasks
                .Include(t => t.Board)
                .FirstOrDefaultAsync(t => t.Id == taskId);
            return task?.Board?.ProjectId ?? Guid.Empty;
        }

        public async Task<Guid> GetProjectIdFromBoard(Guid boardId)
        {
            var board = await _context.Boards.FindAsync(boardId);
            return board?.ProjectId ?? Guid.Empty;
        }
    }
}