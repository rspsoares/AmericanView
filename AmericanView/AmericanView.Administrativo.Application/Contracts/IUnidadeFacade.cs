using AmericanView.Administrativo.Domain;
using System.Collections.Generic;

namespace AmericanView.Administrativo.Application.Contracts
{
    public interface IUnidadeFacade
    {
        long InserirUnidade(Unidade unidade, out string msgErro);
        void AtualizarUnidade(Unidade unidade, out string msgErro);
        List<Unidade> ConsultarUnidade(Unidade unidade, out string msgErro);
        void DesativarUnidade(int Id, out string msgErro);
    }
}
