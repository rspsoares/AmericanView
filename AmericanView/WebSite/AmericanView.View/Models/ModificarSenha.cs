using System.ComponentModel.DataAnnotations;

namespace AmericanView.View.Models
{
    public class ModificarSenha
    {
        [Required(ErrorMessage="Digite sua antiga senha")]
        [DataType(DataType.Password)]
        [Display(Name = "Senha atual")]
        public string OldPassword { get; set; }

        [Required(ErrorMessage = "Digita sua nova senha")]
        [DataType(DataType.Password)]
        [Display(Name = "Nova Senha")]
        public string NewPassword { get; set; }

        [Required(ErrorMessage = "Repita sua nova senha")]
        [Compare("NewPassword", ErrorMessage = "Repita igualmente as senhas.")]
        [DataType(DataType.Password)]
        [Display(Name = "Repetir Nova Senha")]
        public string NewPasswordConfirm { get; set; }
    }
}