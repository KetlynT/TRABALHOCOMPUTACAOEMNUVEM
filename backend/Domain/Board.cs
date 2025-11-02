using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain
{
    public class Board
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public int Position { get; set; }
        public Guid ProjectId { get; set; }
        public Project? Project { get; set; }
        public List<TaskItem> Tasks { get; set; } = new();
    }
}