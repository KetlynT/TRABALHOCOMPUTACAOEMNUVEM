using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain;
public class ActivityLog
{
    [Key]
    public Guid Id { get; set; }
    public string Action { get; set; } = null!;
    public string? ActorName { get; set; }
    public DateTime When { get; set; } = DateTime.UtcNow;
    public string? Metadata { get; set; }
}
