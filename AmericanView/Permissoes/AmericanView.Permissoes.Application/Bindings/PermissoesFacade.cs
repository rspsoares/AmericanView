using AmericanView.Permissoes.Application.Contracts;

namespace AmericanView.Permissoes.Application.Bindings
{
    public class PermissoesFacade : IPermissoesFacade
    {
        public string BuscarPermissoes(string uqUsuario)
        {           
            return "/Home,/Analises,/Cruzamentos,/Cadastros,/Configuracoes,/Sistema,/Usuarios,/Usuarios/Create,/Usuarios/Edit";
            //return _gruposRepo.RetornaPemissoesUsuario(uqUsuario);
        }
    }
}
