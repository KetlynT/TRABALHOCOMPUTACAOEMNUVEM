using ProjectManagement.Api.Data;
using ProjectManagement.Api.Domain;

namespace ProjectManagement.Api.Services
{
    public class ActivityService
    {
        private readonly AppDbContext _context;

        public ActivityService(AppDbContext context)
        {
            _context = context;
        }

        public async Task LogActivityAsync(string description, string userId, Guid? projectId, Guid? taskItemId = null)
        {
            var log = new ActivityLog 
            {
                Description = description,
                UserId = userId,
                ProjectId = projectId,
                TaskItemId = taskItemId,
                Timestamp = DateTime.UtcNow
            };
            
            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}