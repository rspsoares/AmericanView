using Microsoft.VisualStudio.TestTools.UnitTesting;
using AmericanView.Administrativo.Domain;
using AmericanView.Administrativo.Application.Contracts;
using AmericanView.Administrativo.Application.Bindings;
using System.Collections.Generic;

namespace AmericanView.Administrativo.Test
{
    [TestClass]
    public class UnidadeTest
    {
        private IUnidadeFacade _facade = new UnidadeFacade();

        [TestMethod]
        public void Unidade_Inserir()
        {
            long idUnidade = 0;
            string msgErro = string.Empty;
            Unidade unidade = new Unidade();

            unidade.Codigo = "001";
            unidade.Nome = "Nome Unidade";
            unidade.Endereco = "Endereço";
            unidade.Bairro = "Bairro";
            unidade.CEP = "11111-111";
            unidade.Cidade = "Cidade";
            unidade.Estado = "XX";
            unidade.Telefones = "(13) 99348957349";
            unidade.Responsavel = "Responsável";
            unidade.Email = "teste@teste.net";

            idUnidade = _facade.Inserir(unidade, out msgErro);

            Assert.AreEqual(msgErro, string.Empty);
        }

        [TestMethod]
        public void Unidade_Alterar()
        {            
            string msgErro = string.Empty;
            Unidade unidade = new Unidade();

            unidade.Id = 2;
            unidade.Codigo = "999";
            unidade.Nome = "Nome Unidade ALT";
            unidade.Endereco = "Endereço ALT";
            unidade.Bairro = "Bairro ALT";
            unidade.CEP = "99999-999";
            unidade.Cidade = "Cidade ALT";
            unidade.Estado = "AA";
            unidade.Telefones = "(13) 00000000";
            unidade.Responsavel = "Responsável ALT";
            unidade.Email = "ALT@ALT.net";

            _facade.Atualizar(unidade, out msgErro);

            Assert.AreEqual(msgErro, string.Empty);
        }

        [TestMethod]
        public void Unidade_Consultar()
        {
            List<Unidade> lstUnidades = new List<Unidade>();
            string msgErro = string.Empty;
            Unidade unidade = new Unidade();
            unidade.Bairro = "Bairro";

            lstUnidades = _facade.Consultar(unidade, out msgErro);

            Assert.IsTrue(lstUnidades.Count > 0);
        }

        [TestMethod]
        public void Unidade_Desativar()
        {            
            string msgErro = string.Empty;
            
            _facade.Desativar(2, out msgErro);

            Assert.AreEqual(msgErro, string.Empty);
        }
    }
}
