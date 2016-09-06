using AmericanView.Administrativo.Domain;
using System.Collections.Generic;

namespace AmericanView.Administrativo.Application.Contracts
{
    public interface IFuncionarioFacade
    {
        long Inserir(Funcionario funcionario, out string msgErro);
        void Atualizar(Funcionario funcionario, out string msgErro);
        List<Funcionario> Consultar(Funcionario funcionario, out string msgErro);
        void Desativar(long Id, out string msgErro);
        void LancarAtraso(FuncionarioAtrasos atraso, out string msgErro);
        void AtualizarAtraso(FuncionarioAtrasos atraso, out string msgErro);
    }
}
