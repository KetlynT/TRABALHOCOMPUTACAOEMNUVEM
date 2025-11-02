using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain;
public class Comment
{
    [Key]
    public Guid Id { get; set; }
    public Guid TaskItemId { get; set; }
    public TaskItem? TaskItem { get; set; }
    public string AuthorName { get; set; } = "anonymous";
    public string Text { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
