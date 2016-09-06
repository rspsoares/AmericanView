using AmericanView.Administrativo.Application.Contracts;
using System;
using System.Collections.Generic;
using AmericanView.Administrativo.Domain;
using AmericanView.Administrativo.Infrastructure.Repositories;
using NLog;

namespace AmericanView.Administrativo.Application.Bindings
{
    public class UnidadeFacade : IUnidadeFacade
    {
        private UnidadeRepository _repo = new UnidadeRepository();
        private static Logger logger = LogManager.GetCurrentClassLogger();
        
        public long Inserir(Unidade unidade, out string msgErro)
        {
            long idUnidade = 0;
            msgErro = string.Empty;

            try
            {
                idUnidade = _repo.Inserir(unidade);
            }
            catch (Exception ex)
            {
                logger.Error("[InserirUnidade] Erro: {0}", ex.Message);
                msgErro = "Houve um erro ao inserir a unidade.";
            }

            return idUnidade;
        }

        public void Atualizar(Unidade unidade, out string msgErro)
        {
            msgErro = string.Empty;

            try
            {
                _repo.Atualizar(unidade);
            }
            catch (Exception ex)
            {
                logger.Error("[AtualizarUnidade] Erro: {0}", ex.Message);
                msgErro = "Houve um erro ao atualizar a unidade.";
            }            
        }

        public List<Unidade> Consultar(Unidade unidade, out string msgErro)
        {
            List<Unidade> lstUnidades = new List<Unidade>();

            msgErro = string.Empty;

            try
            {
                lstUnidades = _repo.Consultar(unidade);
            }
            catch (Exception ex)
            {
                logger.Error("[ExcluirUnidade] Erro: {0}", ex.Message);
                msgErro = "Houve um erro ao consultar a unidade.";
            }

            return lstUnidades;
        }

        public void Desativar(int Id, out string msgErro)
        {            
            msgErro = string.Empty;

            try
            {
                _repo.Desativar(Id);
            }
            catch (Exception ex)
            {
                logger.Error("[ExcluirUnidade] Erro: {0}", ex.Message);
                msgErro = "Houve um erro ao excluir a unidade.";
            }
        }    
    }
}
