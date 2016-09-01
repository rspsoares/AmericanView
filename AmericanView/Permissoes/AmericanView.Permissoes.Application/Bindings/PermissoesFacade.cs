using AmericanView.Permissoes.Application.Contracts;

namespace AmericanView.Permissoes.Application.Bindings
{
    public class PermissoesFacade : IPermissoesFacade
    {
        public string BuscarPermissoes(string uqUsuario)
        {           
            return "/Home";
            //return _gruposRepo.RetornaPemissoesUsuario(uqUsuario);
        }
    }
}
