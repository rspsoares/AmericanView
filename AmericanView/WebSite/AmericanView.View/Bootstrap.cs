using Castle.Windsor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Keeptrue.Devolucoes.View
{
    public class Bootstrap
    {       
        public IWindsorContainer BootstrapContainer()
        {
            WindsorContainer container = new WindsorContainer();
            container.Register(Castle.MicroKernel.Registration.Classes.FromAssemblyNamed("Keeptrue.Devolucoes.UI.Application")
                                .InNamespace("Keeptrue.Devolucoes.UI.Application.Bindings")
                                .WithService.DefaultInterfaces());
            return container;
        }
        
    }
}
