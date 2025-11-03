using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.DTOs
{
    public class ChangePasswordDto
    {
        [Required]
        public string OldPassword { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "A {0} deve ter pelo menos {2} e no máximo {1} caracteres.", MinimumLength = 6)]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("NewPassword", ErrorMessage = "A nova senha e a senha de confirmação não correspondem.")]
        public string ConfirmPassword { get; set; }
    }
}