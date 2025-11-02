using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain;
public class TaskAttachment
{
    [Key]
    public Guid Id { get; set; }
    public Guid TaskItemId { get; set; }
    public TaskItem? TaskItem { get; set; }
    public string FileName { get; set; } = null!;
    public string FilePath { get; set; } = null!; // caminho relativo /uploads/...
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? UploadedBy { get; set; }
}
