namespace ProjectManagement.Api.DTOs
{
    public class TaskReorderDto
    {
        public Guid TaskId { get; set; }
        public Guid SourceBoardId { get; set; }
        public Guid DestinationBoardId { get; set; }
        public int DestinationIndex { get; set; }
    }
}