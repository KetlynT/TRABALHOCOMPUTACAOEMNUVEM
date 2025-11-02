using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain;
public class Board
{
    [Key]
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
