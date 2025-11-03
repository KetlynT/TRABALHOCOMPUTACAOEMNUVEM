using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.DTOs
{
    public class ProjectCreateDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}