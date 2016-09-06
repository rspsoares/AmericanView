using AmericanView.Administrativo.Domain;
using System.Collections.Generic;

namespace AmericanView.Administrativo.Application.Contracts
{
    public interface IUnidadeFacade
    {
        long Inserir(Unidade unidade, out string msgErro);
        void Atualizar(Unidade unidade, out string msgErro);
        List<Unidade> Consultar(Unidade unidade, out string msgErro);
        void Desativar(int Id, out string msgErro);
    }
}
