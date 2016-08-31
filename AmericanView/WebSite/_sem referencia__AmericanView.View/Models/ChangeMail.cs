using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;

namespace Keeptrue.Conciliador.View.Models
{
    public class ChangeEmailRequestInputModel
    {
        [Required(ErrorMessage = "É necessário um e-mail.")]
        [EmailAddress(ErrorMessage = "O e-mail precisa ser válido.")]
        [Display(Name = "Novo E-mail")]
        public string NewEmail { get; set; }
    }

    public class ChangeEmailFromKeyInputModel
    {
        [Required(ErrorMessage = "É necessário confirmar com sua senha.")]
        [DataType(DataType.Password)]
        [Display(Name = "Senha")]
        public string Password { get; set; }

        [HiddenInput]
        public string Key { get; set; }
    }
}