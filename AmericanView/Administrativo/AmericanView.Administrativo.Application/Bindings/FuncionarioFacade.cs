using AmericanView.Administrativo.Application.Contracts;
using System;
using System.Collections.Generic;
using AmericanView.Administrativo.Domain;
using NLog;
using AmericanView.Administrativo.Infrastructure.Repositories;

namespace AmericanView.Administrativo.Application.Bindings
{
    public class FuncionarioFacade : IFuncionarioFacade
    {
        private FuncionarioRepository _repo = new FuncionarioRepository();
        private static Logger logger = LogManager.GetCurrentClassLogger();

        public long Inserir(Funcionario funcionario, out string msgErro)
        {
            long Id = 0;
            msgErro = string.Empty;

            try
            {
                Id = _repo.Inserir(funcionario);
            }
            catch (Exception ex)
            {
                logger.Error("[InserirFuncionario] Erro: {0}", ex.Message);
                msgErro = "Houve um erro ao inserir o funcionário.";
            }

            return Id;
        }

        public void Atualizar(Funcionario funcionario, out string msgErro)
        {
            msgErro = string.Empty;

            try
            {
                _repo.Atualizar(funcionario);
            }
            catch (Exception ex)
            {
                logger.Error("[AtualizarFuncionario] Erro: {0}", ex.Message);
                msgErro = "Houve um erro ao atualizar o funcionário.";
            }
        }

        public List<Funcionario> Consultar(Funcionario funcionario, out string msgErro)
        {
            List<Funcionario> lstFuncionarios = new List<Funcionario>();

            msgErro = string.Empty;

            try
            {
                lstFuncionarios = _repo.Consultar(funcionario);
            }
            catch (Exception ex)
            {
                logger.Error("[ConsultarFuncionario] Erro: {0}", ex.Message);
                msgErro = "Houve um erro ao consultar o funcionário.";
            }

            return lstFuncionarios;
        }

        public void Desativar(long Id, out string msgErro)
        {
            msgErro = string.Empty;

            try
            {
                _repo.Desativar(Id);
            }
            catch (Exception ex)
            {
                logger.Error("[DesativarFuncionario] Erro: {0}", ex.Message);
                msgErro = "Houve um erro ao desativar o funcionário.";
            }
        }

        public void LancarAtraso(FuncionarioAtrasos atraso, out string msgErro)
        {
            msgErro = string.Empty;

            try
            {
                _repo.LancarAtraso(atraso);
            }
            catch (Exception ex)
            {
                logger.Error("[LancarAtrasoFuncionario] Erro: {0}", ex.Message);
                msgErro = "Houve um erro ao lançar o atraso do funcionário.";
            }
        }

        public void AtualizarAtraso(FuncionarioAtrasos atraso, out string msgErro)
        {
            msgErro = string.Empty;

            try
            {
                _repo.AtualizarAtraso(atraso);
            }
            catch (Exception ex)
            {
                logger.Error("[AtualizarAtrasoFuncionario] Erro: {0}", ex.Message);
                msgErro = "Houve um erro ao atualizar o atraso do funcionário.";
            }
        }
    }
}
