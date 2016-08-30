using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Web.Mvc;
using System.ComponentModel;

namespace AmericanView.View.Models
{
    public enum TipoPerfil
    {
        [Description("Desenvolvedor")]
        Desenvolvedor = 1,
        [Description("Funcional")]
        Funcional = 2,
        [Description("Cliente")]
        Cliente = 3
    }
    public class Registro
    {
        public Registro()
        {
            Roles = new List<SelectListItem>();
        }

        [Required(ErrorMessage = "Escolha o Perfil.")]
        [Display(Name = "Perfil")]
        public int Role { get; set; }
        public IEnumerable<SelectListItem> Roles { get; set; }

        [ScaffoldColumn(false)]
        [Display(Name = "Nome de usuário")]
        public string Username { get; set; }

        [Required(ErrorMessage="Insira seu primeiro nome.")]
        [Display(Name = "Nome")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Insira seu sobrenome.")]
        [Display(Name = "Sobrenome")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Um e-mail válido é necessário.")]
        [EmailAddress]
        [Display(Name = "E-mail")]
        public string Email { get; set; }

        [Phone]
        [Display(Name = "Telefone")]
        public string MobilePhoneNumber { get; set; }

        [Required(ErrorMessage = "Digite sua senha.")]
        [DataType(DataType.Password)]
        [Display(Name = "Senha")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Repita sua senha.")]
        [System.ComponentModel.DataAnnotations.Compare("Password", ErrorMessage = "Ambas as senhas devem ser iguais.")]
        [DataType(DataType.Password)]
        [Display(Name = "Repetir Senha")]
        public string ConfirmPassword { get; set; }
    }
}