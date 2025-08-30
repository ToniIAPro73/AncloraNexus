import React from 'react';
import { IconConverterLogo, IconEnvelope, IconChatBubble, IconVisa, IconMastercard, IconChevronDown } from './Icons';

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <li>
        <a href={href} className="text-slate-400 hover:text-white transition-colors">
            {children}
        </a>
    </li>
);

export const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-800 text-white">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-b-2 border-slate-700">
                    <div>
                        <h3 className="text-h3 font-bold mb-4">Â¿TodavÃ­a tienes una pregunta?</h3>
                        <p className="text-slate-400">PÃ³ngase en contacto con nuestro amable equipo de soporte.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="flex items-start space-x-4">
                            <IconEnvelope className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="text-h4 font-semibold">contact@online-file-converter.com</h4>
                                <p className="text-sm text-green-400">Respuesta en menos de 24 horas</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <IconChatBubble className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="text-h4 font-semibold">Ve al chat</h4>
                                <p className="text-sm text-green-400">Respuesta en menos de 24 horas</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <IconConverterLogo className="w-12 h-12 text-green-400 mb-4" />
                        <button className="w-full sm:w-auto flex items-center justify-between px-4 py-2 bg-slate-700 rounded-md text-left">
                            <span>EspaÃ±ol</span>
                            <IconChevronDown className="w-5 h-5" />
                        </button>
                    </div>

                    <div>
                        <h5 className="font-bold mb-4">Convertir</h5>
                        <ul className="space-y-3">
                            <FooterLink href="#">Imagen</FooterLink>
                            <FooterLink href="#">Documento</FooterLink>
                            <FooterLink href="#">Audio</FooterLink>
                            <FooterLink href="#">Video</FooterLink>
                            <FooterLink href="#">PresentaciÃ³n</FooterLink>
                            <FooterLink href="#">Fuente</FooterLink>
                            <FooterLink href="#">Libro ElectrÃ³nico</FooterLink>
                            <FooterLink href="#">Archivo</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold mb-4">Comprimir</h5>
                        <ul className="space-y-3">
                            <FooterLink href="#">Documento</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold mb-4">Herramientas PDF</h5>
                        <ul className="space-y-3">
                            <FooterLink href="#">Convertir</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold mb-4">Acerca de</h5>
                        <ul className="space-y-3">
                            <FooterLink href="#">Precios</FooterLink>
                            <FooterLink href="/formats">Formatos Compatibles</FooterLink>
                            <FooterLink href="#">FAQ</FooterLink>
                        </ul>
                        <a href="#" className="mt-6 inline-block w-full text-center px-4 py-2 border border-white rounded-md hover:bg-white hover:text-slate-800 font-semibold transition-colors">
                            Iniciar sesiÃ³n
                        </a>
                    </div>
                </div>

                <div className="py-8 flex flex-col md:flex-row justify-between items-center border-t-2 border-slate-700">
                    <div className="flex space-x-6">
                        <FooterLink href="#">Aviso legal</FooterLink>
                        <FooterLink href="#">PolÃ­tica de privacidad</FooterLink>
                        <FooterLink href="#">TÃ©rminos y condiciones generales</FooterLink>
                        <FooterLink href="#">Darse de baja</FooterLink>
                    </div>
                    <div className="flex items-center space-x-4 mt-6 md:mt-0">
                        <span className="text-slate-400">Pagos seguros</span>
                        <IconVisa className="w-10 h-auto text-white" />
                        <IconMastercard className="w-10 h-auto text-white" />
                        <p className="text-slate-400">&copy; 2023 online-file-converter.<br/>Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

