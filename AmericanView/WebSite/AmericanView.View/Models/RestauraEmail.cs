using System.ComponentModel.DataAnnotations;

namespace AmericanView.View.Models
{
    public class RestauraEmail
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "Digite seu e-mail.")]
        [Display(Name = "E-mail")]
        [EmailAddress(ErrorMessage = "E-mail inválido")]
        public string Email { get; set; }       
    }
}