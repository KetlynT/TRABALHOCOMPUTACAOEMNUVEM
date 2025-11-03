namespace ProjectManagement.Api.DTOs
{
    public class TaskUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public string? AssigneeId { get; set; }
    }
}