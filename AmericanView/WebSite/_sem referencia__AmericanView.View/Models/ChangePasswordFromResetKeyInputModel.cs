using System.Web.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Keeptrue.Conciliador.View.Models
{
    public class ChangePasswordFromResetKeyInputModel
    {
        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Senha")]
        public string Password { get; set; }

        [Required]
        [System.ComponentModel.DataAnnotations.Compare("Password", ErrorMessage = "Repita igualmente as senhas.")]
        [DataType(DataType.Password)]
        [Display(Name = "Confirmar senha")]
        public string ConfirmPassword { get; set; }

        [HiddenInput]
        public string Key { get; set; }
    }
}