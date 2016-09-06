using AmericanView.Administrativo.Application.Bindings;
using AmericanView.Administrativo.Application.Contracts;
using AmericanView.Administrativo.Domain;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.IO;

namespace AmericanView.Administrativo.Test
{
    [TestClass]
    public class FuncionarioTest
    {
        private IFuncionarioFacade _facade = new FuncionarioFacade();

        [TestMethod]
        public void Funcionario_Inserir()
        {
            long idFuncionario = 0;
            string msgErro = string.Empty;
            Funcionario funcionario = new Funcionario();

            funcionario.IdUnidade = 3;
            funcionario.Nome = "Prof";
            funcionario.RG = "11111";
            funcionario.CPF = "22222";
            funcionario.Endereco = "Endereço";
            funcionario.Bairro = "Bairro";
            funcionario.CEP = "11111-111";
            funcionario.Cidade = "Cidade";
            funcionario.Estado = "XX";
            funcionario.Telefones = "(11) 1111-1111";
            funcionario.Email = "teste@teste.com";
            funcionario.utilizaVT = true;
            funcionario.DataAdmissao = DateTime.Now;
            funcionario.DataDemissao = null;

            idFuncionario = _facade.Inserir(funcionario, out msgErro);

            Assert.AreEqual(msgErro, string.Empty);
        }
        [TestMethod]
        public void Funcionario_Alterar()
        {
            string msgErro = string.Empty;
            Funcionario funcionario = new Funcionario();

            funcionario.Id = 2;
            funcionario.IdUnidade = 3;
            funcionario.Nome = "Prof ALT";
            funcionario.RG = "11111 ALT";
            funcionario.CPF = "22222 ALT";
            funcionario.Endereco = "Endereço ALT";
            funcionario.Bairro = "Bairro ALT";
            funcionario.CEP = "11111-999";
            funcionario.Cidade = "Cidade ALT";
            funcionario.Estado = "AA";
            funcionario.Telefones = "(11) 1111-1111  ALT";
            funcionario.Email = "teste@teste.com  ALT";
            funcionario.utilizaVT = false;
            funcionario.DataAdmissao = DateTime.Now;
            funcionario.DataDemissao = DateTime.Now;


            _facade.Atualizar(funcionario, out msgErro);

            Assert.AreEqual(msgErro, string.Empty);
        }

        [TestMethod]
        public void Funcionario_Consultar()
        {
            List<Funcionario> lstFuncionario = new List<Funcionario>();
            string msgErro = string.Empty;
            Funcionario unidade = new Funcionario();

            unidade.IdUnidade = 3;

            lstFuncionario = _facade.Consultar(unidade, out msgErro);

            Assert.IsTrue(lstFuncionario.Count > 0);
        }

        [TestMethod]
        public void Funcionario_Desativar()
        {
            string msgErro = string.Empty;

            _facade.Desativar(2, out msgErro);

            Assert.AreEqual(msgErro, string.Empty);
        }

        [TestMethod]
        public void Funcionario_LancarAtraso()
        {
            FuncionarioAtrasos atraso = new FuncionarioAtrasos();
            string msgErro = string.Empty;

            atraso.IdFuncionario = 2;
            atraso.Atraso = DateTime.Parse("00:20:00");
            
            FileInfo fileInfo = new FileInfo(@"C:\_Rodrigo\AmericanView\logo.jpg");
            long imageFileLength = fileInfo.Length;
            FileStream fs = new FileStream(@"C:\_Rodrigo\AmericanView\logo.jpg", FileMode.Open, FileAccess.Read);
            BinaryReader br = new BinaryReader(fs);
            atraso.Atestado = br.ReadBytes((int)imageFileLength);

            _facade.LancarAtraso(atraso, out msgErro);

            Assert.AreEqual(msgErro, string.Empty);
        }

        [TestMethod]
        public void Funcionario_AtualizarAtraso()
        {
            FuncionarioAtrasos atraso = new FuncionarioAtrasos();
            string msgErro = string.Empty;

            atraso.Id = 10;
            atraso.IdFuncionario = 2;
            atraso.Atraso = DateTime.Parse("00:33:00");

            FileInfo fileInfo = new FileInfo(@"C:\_Rodrigo\AmericanView\logo.jpg");
            long imageFileLength = fileInfo.Length;
            FileStream fs = new FileStream(@"C:\_Rodrigo\AmericanView\logo.jpg", FileMode.Open, FileAccess.Read);
            BinaryReader br = new BinaryReader(fs);
            atraso.Atestado = br.ReadBytes((int)imageFileLength);

            _facade.AtualizarAtraso(atraso, out msgErro);

            Assert.AreEqual(msgErro, string.Empty);
        }

    }
}
