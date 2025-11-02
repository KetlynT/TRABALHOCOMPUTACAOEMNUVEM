using ProjectManagement.Api.Data;
using ProjectManagement.Api.Domain;

namespace ProjectManagement.Api.Services;
public class ActivityService
{
    private readonly AppDbContext _db;
    public ActivityService(AppDbContext db) => _db = db;

    public async Task Log(string action, string? actorName = null, object? metadata = null)
    {
        var log = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = action,
            ActorName = actorName,
            When = DateTime.UtcNow,
            Metadata = metadata is null ? null : System.Text.Json.JsonSerializer.Serialize(metadata)
        };
        _db.ActivityLogs.Add(log);
        await _db.SaveChangesAsync();
    }
}
