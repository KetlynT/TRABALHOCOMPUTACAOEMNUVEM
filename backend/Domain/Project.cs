using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain;
public class Project
{
    [Key]
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Board> Boards { get; set; } = new List<Board>();
}
