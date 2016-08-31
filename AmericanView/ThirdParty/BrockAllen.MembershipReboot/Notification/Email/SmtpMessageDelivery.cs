/*
 * Copyright (c) Brock Allen.  All rights reserved.
 * see license.txt
 */

using System;
using System.Configuration;
using System.Net;
using System.Net.Configuration;
using System.Net.Mail;

namespace BrockAllen.MembershipReboot
{
    public class SmtpMessageDelivery : IMessageDelivery
    {
        private readonly bool sendAsHtml;

        public SmtpMessageDelivery(bool sendAsHtml = false)
        {
            this.sendAsHtml = sendAsHtml;
        }

        public void Send(Message msg)
        {
            Tracing.Information("[SmtpMessageDelivery.Send] sending mail to " + msg.To);

            SmtpSection smtpSection = (SmtpSection)ConfigurationManager.GetSection("system.net/mailSettings/smtp");
            
            if (string.IsNullOrWhiteSpace(msg.From))
                msg.From = smtpSection.From;            

            using (SmtpClient client = new SmtpClient())
            {
                client.Timeout = 20000;
                client.Host = smtpSection.Network.Host;
                client.Port = smtpSection.Network.Port;
                client.DeliveryMethod = SmtpDeliveryMethod.Network;
                client.EnableSsl = smtpSection.Network.EnableSsl;
                client.Credentials = new NetworkCredential(smtpSection.Network.UserName, smtpSection.Network.Password);
                client.UseDefaultCredentials = false;

                try
                {
                    MailMessage mailMessage = new MailMessage(msg.From, msg.To, msg.Subject, msg.Body)
                    {
                        IsBodyHtml = sendAsHtml
                    };

                    client.Send(mailMessage);
                }
                catch (SmtpException e)
                {
                    Tracing.Error("[SmtpMessageDelivery.Send] SmtpException: " + e.Message);
                }
                catch (Exception e)
                {
                    Tracing.Error("[SmtpMessageDelivery.Send] Exception: " + e.Message);
                }
            }
        }
    }
}
