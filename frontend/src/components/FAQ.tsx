import React, { useState } from 'react';
import { IconPlus, IconMinus } from './Icons';

type FAQItemProps = {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
};

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-slate-200">
    <button onClick={onClick} className="w-full flex justify-between items-center text-left py-5">
      <h3 className={`text-h3 font-medium ${isOpen ? 'text-green-600' : 'text-slate-800'}`}>{question}</h3>
      {isOpen ? <IconMinus className="w-6 h-6 text-green-600" /> : <IconPlus className="w-6 h-6 text-slate-500" />}
    </button>
    {isOpen && (
      <div className="pb-5 pr-8 text-slate-600">
        <p>{answer}</p>
      </div>
    )}
  </div>
);

type FAQData = {
    [key: string]: {
        question: string;
        answer: string;
    }[];
};

const faqData: FAQData = {
    Conversions: [
        {
            question: 'Â¿QuÃ© tipos de archivos puedo convertir con?',
            answer: 'En, estamos orgullosos de ofrecer una plataforma versÃ¡til que admite cientos de formatos en ocho tipos de archivos diferentes. No importa si estÃ¡s tratando con imÃ¡genes, documentos, libros electrÃ³nicos, archivos de archivos (.zip, .rar ...), archivos de audio, archivos de video, presentaciones o fuentes, te tenemos cubierto.'
        },
        { question: 'Â¿Hay un lÃ­mite de tamaÃ±o mÃ¡ximo para los archivos que se pueden convertir?', answer: 'SÃ­, el lÃ­mite de tamaÃ±o depende de tu plan de suscripciÃ³n. Los usuarios gratuitos pueden convertir archivos de hasta 100 MB, mientras que los suscriptores premium disfrutan de lÃ­mites mucho mÃ¡s altos.' },
    ],
    SuscribiÃ©ndose: [
        {
            question: 'Â¿CuÃ¡nto cuesta la suscripciÃ³n?',
            answer: 'Ãšnete por solo y disfruta de acceso ilimitado a nuestro servicio superior de conversiÃ³n de archivos por un perÃ­odo de prueba de 24 horas. Â¿Te encantÃ³ tu experiencia? QuÃ©date con nosotros por una pequeÃ±a inversiÃ³n de 47,90â‚¬ al mes para conversiones de archivos ilimitadas.'
        },
        { question: 'Â¿QuÃ© mÃ©todos de pago aceptan?', answer: 'Aceptamos todas las principales tarjetas de crÃ©dito (Visa, MasterCard, American Express) y PayPal.' },
        { question: 'Â¿Tengo que renovar mi suscripciÃ³n manualmente cada mes?', answer: 'No, tu suscripciÃ³n se renovarÃ¡ automÃ¡ticamente al final de cada ciclo de facturaciÃ³n para garantizar un servicio ininterrumpido. Puedes cancelar en cualquier momento.' },
        { question: 'Â¿Ofrecen suscripciones a largo plazo como planes anuales o de por vida?', answer: 'SÃ­, ofrecemos planes anuales con un descuento significativo en comparaciÃ³n con el plan mensual. Por favor, contacta a nuestro soporte para mÃ¡s detalles sobre planes a largo plazo.' },
    ],
    Cuenta: [
        { question: 'Â¿CÃ³mo puedo crear una cuenta?', answer: 'Crear una cuenta es un proceso sin complicaciones. Simplemente comience a utilizar nuestro convertidor de archivos despuÃ©s de que convierta su archivo, se le pedirÃ¡ que cree una cuenta para continuar. Â¡Es asÃ­ de fÃ¡cil!' },
        { question: 'Â¿QuÃ© puedo hacer desde mi tablero?', answer: 'Desde tu tablero, puedes ver tu historial de conversiones, descargar archivos convertidos previamente, gestionar tu suscripciÃ³n y actualizar la informaciÃ³n de tu cuenta.' },
        { question: 'Â¿CÃ³mo puedo cambiar mi informaciÃ³n personal como el correo electrÃ³nico y la contraseÃ±a?', answer: 'Puedes actualizar tu informaciÃ³n personal en la secciÃ³n "ConfiguraciÃ³n de la cuenta" de tu tablero.' },
        { question: 'Â¿QuÃ© debo hacer si olvidÃ© mi contraseÃ±a?', answer: 'Si olvidas tu contraseÃ±a, haz clic en el enlace "Â¿Olvidaste tu contraseÃ±a?" en la pÃ¡gina de inicio de sesiÃ³n e introduce tu direcciÃ³n de correo electrÃ³nico. Te enviaremos un enlace para restablecer tu contraseÃ±a.' },
        { question: 'Â¿CÃ³mo puedo rastrear mis conversiones pasadas?', answer: 'Tu historial de conversiones estÃ¡ disponible en tu tablero. Mostramos una lista de todas tus conversiones recientes junto con la opciÃ³n de descargar los archivos.' },
        { question: 'Â¿QuÃ© tan segura es mi cuenta?', answer: 'Nos tomamos la seguridad muy en serio. Tu cuenta estÃ¡ protegida con cifrado estÃ¡ndar de la industria y nunca compartimos tus datos con terceros.' },
    ],
};

const tabs = ['Conversions', 'SuscribiÃ©ndose', 'Cuenta'];

export const FAQ: React.FC = () => {
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [openQuestion, setOpenQuestion] = useState<string | null>(faqData[tabs[0]][0].question);

    const handleQuestionClick = (question: string) => {
        setOpenQuestion(openQuestion === question ? null : question);
    };

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        setOpenQuestion(faqData[tab][0].question); // Open first question of new tab
    }

    return (
        <section className="w-full max-w-4xl mx-auto py-16 sm:py-24">
            <h2 className="text-h2 font-bold text-slate-800 tracking-tight text-center mb-12">
                Â¿Puede que tenga algunas preguntas?
            </h2>
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/50 p-4 sm:p-8">
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabClick(tab)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
                                    activeTab === tab 
                                    ? 'border-green-500 text-green-600' 
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-6">
                    {faqData[activeTab].map(item => (
                        <FAQItem
                            key={item.question}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openQuestion === item.question}
                            onClick={() => handleQuestionClick(item.question)}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-12 text-center bg-slate-100/70 rounded-lg p-8">
                <h3 className="text-h3 font-bold text-slate-800">Â¿TodavÃ­a tienes una pregunta?</h3>
                <p className="mt-2 text-slate-600">Si no puedes encontrar una respuesta a tu pregunta en nuestras preguntas frecuentes, siempre puedes contactarnos. Â¡Estaremos encantados de responderte!</p>
                <div className="mt-6">
                    <button className="px-6 py-3 border border-slate-300 text-slate-800 font-semibold rounded-lg hover:bg-white transition-colors">
                        Contacto
                    </button>
                </div>
            </div>
        </section>
    );
};

