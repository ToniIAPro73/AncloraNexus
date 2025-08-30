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
            question: '¿Qué tipos de archivos puedo convertir con?',
            answer: 'En, estamos orgullosos de ofrecer una plataforma versátil que admite cientos de formatos en ocho tipos de archivos diferentes. No importa si estás tratando con imágenes, documentos, libros electrónicos, archivos de archivos (.zip, .rar ...), archivos de audio, archivos de video, presentaciones o fuentes, te tenemos cubierto.'
        },
        { question: '¿Hay un límite de tamaño máximo para los archivos que se pueden convertir?', answer: 'Sí, el límite de tamaño depende de tu plan de suscripción. Los usuarios gratuitos pueden convertir archivos de hasta 100 MB, mientras que los suscriptores premium disfrutan de límites mucho más altos.' },
    ],
    Suscribiéndose: [
        {
            question: '¿Cuánto cuesta la suscripción?',
            answer: 'Únete por solo y disfruta de acceso ilimitado a nuestro servicio superior de conversión de archivos por un período de prueba de 24 horas. ¿Te encantó tu experiencia? Quédate con nosotros por una pequeña inversión de 47,90€ al mes para conversiones de archivos ilimitadas.'
        },
        { question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos todas las principales tarjetas de crédito (Visa, MasterCard, American Express) y PayPal.' },
        { question: '¿Tengo que renovar mi suscripción manualmente cada mes?', answer: 'No, tu suscripción se renovará automáticamente al final de cada ciclo de facturación para garantizar un servicio ininterrumpido. Puedes cancelar en cualquier momento.' },
        { question: '¿Ofrecen suscripciones a largo plazo como planes anuales o de por vida?', answer: 'Sí, ofrecemos planes anuales con un descuento significativo en comparación con el plan mensual. Por favor, contacta a nuestro soporte para más detalles sobre planes a largo plazo.' },
    ],
    Cuenta: [
        { question: '¿Cómo puedo crear una cuenta?', answer: 'Crear una cuenta es un proceso sin complicaciones. Simplemente comience a utilizar nuestro convertidor de archivos después de que convierta su archivo, se le pedirá que cree una cuenta para continuar. ¡Es así de fácil!' },
        { question: '¿Qué puedo hacer desde mi tablero?', answer: 'Desde tu tablero, puedes ver tu historial de conversiones, descargar archivos convertidos previamente, gestionar tu suscripción y actualizar la información de tu cuenta.' },
        { question: '¿Cómo puedo cambiar mi información personal como el correo electrónico y la contraseña?', answer: 'Puedes actualizar tu información personal en la sección "Configuración de la cuenta" de tu tablero.' },
        { question: '¿Qué debo hacer si olvidé mi contraseña?', answer: 'Si olvidas tu contraseña, haz clic en el enlace "¿Olvidaste tu contraseña?" en la página de inicio de sesión e introduce tu dirección de correo electrónico. Te enviaremos un enlace para restablecer tu contraseña.' },
        { question: '¿Cómo puedo rastrear mis conversiones pasadas?', answer: 'Tu historial de conversiones está disponible en tu tablero. Mostramos una lista de todas tus conversiones recientes junto con la opción de descargar los archivos.' },
        { question: '¿Qué tan segura es mi cuenta?', answer: 'Nos tomamos la seguridad muy en serio. Tu cuenta está protegida con cifrado estándar de la industria y nunca compartimos tus datos con terceros.' },
    ],
};

const tabs = ['Conversions', 'Suscribiéndose', 'Cuenta'];

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
                ¿Puede que tenga algunas preguntas?
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
                <h3 className="text-h3 font-bold text-slate-800">¿Todavía tienes una pregunta?</h3>
                <p className="mt-2 text-slate-600">Si no puedes encontrar una respuesta a tu pregunta en nuestras preguntas frecuentes, siempre puedes contactarnos. ¡Estaremos encantados de responderte!</p>
                <div className="mt-6">
                    <button className="px-6 py-3 border border-slate-300 text-slate-800 font-semibold rounded-lg hover:bg-white transition-colors">
                        Contacto
                    </button>
                </div>
            </div>
        </section>
    );
};
