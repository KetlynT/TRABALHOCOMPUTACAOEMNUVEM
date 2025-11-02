using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain;
public class TaskItem
{
    [Key]
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = "todo";
    public Guid BoardId { get; set; }
    public Board? Board { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
