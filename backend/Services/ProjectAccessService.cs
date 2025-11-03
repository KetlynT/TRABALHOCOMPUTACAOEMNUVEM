using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using System;
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
            return await _context.Projects
                .AnyAsync(p => p.Id == projectId && 
                               (p.OwnerId == userId || p.Members.Any(m => m.UserId == userId)));
        }

        public async Task<Guid> GetProjectIdFromTask(Guid taskId)
        {
            var task = await _context.Tasks
                .AsNoTracking()
                .Include(t => t.Board)
                .FirstOrDefaultAsync(t => t.Id == taskId);
            
            return task?.Board?.ProjectId ?? Guid.Empty;
        }

        public async Task<Guid> GetProjectIdFromBoard(Guid boardId)
        {
             var board = await _context.Boards
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == boardId);
            
            return board?.ProjectId ?? Guid.Empty;
        }
    }
}