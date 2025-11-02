using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Domain
{
    public class TaskAttachment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public string FilePath { get; set; } = string.Empty;
        [Required]
        public string FileName { get; set; } = string.Empty;
        public string? FileType { get; set; } 
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public Guid TaskItemId { get; set; }
        public TaskItem? TaskItem { get; set; }
    }
}