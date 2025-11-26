using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.DTOs
{
    public class CommentCreateDto
    {
        [Required(ErrorMessage = "O conteúdo do comentário é obrigatório.")]
        public string Content { get; set; } = string.Empty;
    }
}