using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Web.Mvc;
using System.ComponentModel;

namespace Keeptrue.Conciliador.View.Models
{
    public class PerfilPermissao
    {
        [Display(Name = "Perfil")]
        public string Perfil { get; set; }

        public int Identificador { get; set; }
    }
}