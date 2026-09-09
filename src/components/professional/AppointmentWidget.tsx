"use client";
import { useState, useEffect } from "react";
import {
  Clock, User, Mail, Phone, MessageSquare,
  ChevronLeft, ChevronRight, CheckCircle, Loader2, Calendar,
} from "lucide-react";
import { Professional, Appointment } from "@/types";
import { getBookedSlots, saveAppointment, generateId, isDateBlocked } from "@/lib/storage";

const DAY_NAMES   = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const MONTH_NAMES = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + duration <= endMin) {
    const h = Math.floor(cur / 60).toString().padStart(2, "0");
    const m = (cur % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    cur += duration;
  }
  return slots;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

interface Props { pro: Professional; onClose?: () => void; }

export default function AppointmentWidget({ pro, onClose }: Props) {
  const [step, setStep]               = useState<"calendar"|"form"|"done">("calendar");
  const [month, setMonth]             = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string|null>(null);
  const [selectedTime, setSelectedTime] = useState<string|null>(null);
  const [bookedSlots, setBookedSlots]   = useState<string[]>([]);
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", message:"" });
  const [errors, setErrors] = useState<Record<string,string>>({});

  const duration   = pro.agendaSlotDuration || 30;
  const startTime  = pro.agendaStartTime    || "09:00";
  const endTime    = pro.agendaEndTime      || "18:00";
  const activeDays = pro.agendaDays         || [1,2,3,4,5];

  useEffect(() => {
    if (selectedDate) setBookedSlots(getBookedSlots(pro.id, selectedDate));
  }, [selectedDate, pro.id]);

  // Calendar grid
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay  = new Date(month.getFullYear(), month.getMonth()+1, 0);
  const today    = new Date(); today.setHours(0,0,0,0);

  const calDays: (Date|null)[] = [];
  for (let i = 0; i < firstDay.getDay(); i++) calDays.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++)
    calDays.push(new Date(month.getFullYear(), month.getMonth(), d));

  const isAvailable = (d: Date) => {
    if (d < today) return false;
    if (!activeDays.includes(d.getDay())) return false;
    return !isDateBlocked(pro.id, toDateStr(d)); // vérifie congés
  };

  // Available time slots (minus booked AND blocked)
  const allSlots = selectedDate
    ? generateSlots(startTime, endTime, duration)
    : [];
  const slots = allSlots.filter(s =>
    !bookedSlots.includes(s) && !isDateBlocked(pro.id, selectedDate!, s)
  );

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim())                               e.name  = "Requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    const appt: Appointment = {
      id: generateId(),
      professionalId: pro.id,
      professionalName: pro.companyName,
      professionalEmail: pro.email,
      visitorName: form.name,
      visitorEmail: form.email,
      visitorPhone: form.phone,
      visitorMessage: form.message,
      date: selectedDate,
      time: selectedTime,
      duration,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveAppointment(appt);
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "new", appointment: appt }),
      });
    } catch {}
    setSubmitting(false);
    setStep("done");
  };

  if (step === "done") return (
    <div className="p-8 text-center space-y-4">
      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-7 h-7 text-green-600" />
      </div>
      <h3 className="font-bold text-landes-pine text-lg">Rendez-vous enregistré !</h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        Votre rendez-vous le{" "}
        <strong>{new Date(selectedDate!+"T12:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</strong>{" "}
        à <strong>{selectedTime}</strong> a bien été pris en compte.<br />
        Un email de confirmation a été envoyé à <strong>{form.email}</strong>.<br />
        Vous recevrez un rappel 24h avant.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => { setStep("calendar"); setSelectedDate(null); setSelectedTime(null); setForm({name:"",email:"",phone:"",message:""}); }}
          className="text-sm text-landes-forest hover:underline"
        >
          Prendre un autre rendez-vous
        </button>
        {onClose && (
          <button onClick={onClose} className="text-sm btn-primary py-2 px-5">
            Fermer
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {pro.agendaMessage && (
        <p className="px-5 pt-4 pb-0 text-sm text-gray-600 italic border-b border-gray-100 pb-4">{pro.agendaMessage}</p>
      )}

      {/* STEP 1 : Calendar + time slots */}
      {step === "calendar" && (
        <div className="p-5 space-y-5">

          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth()-1, 1))}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-gray-800 capitalize">
              {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
            </span>
            <button
              onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth()+1, 1))}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 text-center">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
            {calDays.map((d, i) => {
              if (!d) return <div key={`e-${i}`} />;
              const ds    = toDateStr(d);
              const avail = isAvailable(d);
              const sel   = ds === selectedDate;
              const blocked = isDateBlocked(pro.id, ds);
              return (
                <button
                  key={ds}
                  disabled={!avail}
                  onClick={() => { setSelectedDate(ds); setSelectedTime(null); }}
                  title={blocked ? "Indisponible" : undefined}
                  className={`aspect-square rounded-lg text-sm font-medium transition-all mx-0.5 my-0.5 ${
                    sel     ? "bg-landes-forest text-white shadow-md" :
                    blocked ? "bg-red-50 text-red-300 cursor-not-allowed line-through" :
                    avail   ? "hover:bg-landes-forest/10 text-gray-800" :
                              "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-landes-forest inline-block" /> Sélectionné</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Indisponible</span>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-landes-sage" />
                {new Date(selectedDate+"T12:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
              </p>
              {slots.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-400">Aucun créneau disponible ce jour.</p>
                  <p className="text-xs text-gray-300 mt-1">Choisissez une autre date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map(s => (
                    <button key={s} onClick={() => setSelectedTime(s)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        selectedTime === s
                          ? "bg-landes-forest text-white border-landes-forest shadow-sm"
                          : "border-gray-200 text-gray-700 hover:border-landes-sage hover:bg-landes-sage/5"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedDate && selectedTime && (
            <button onClick={() => setStep("form")} className="btn-primary w-full flex items-center justify-center gap-2">
              Continuer <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* STEP 2 : Contact form */}
      {step === "form" && (
        <div className="p-5 space-y-4">
          {/* Summary */}
          <div className="bg-landes-forest/5 border border-landes-sage/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-landes-forest/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-landes-forest" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-landes-pine">
                {new Date(selectedDate!+"T12:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
              </p>
              <p className="text-xs text-gray-500">{selectedTime} — {duration} min</p>
            </div>
            <button onClick={() => setStep("calendar")} className="text-xs text-landes-forest hover:underline">
              Modifier
            </button>
          </div>

          <div>
            <label className="label flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Nom complet *</label>
            <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} className="input-field" placeholder="Jean Dupont" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email *</label>
            <input type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} className="input-field" placeholder="vous@email.fr" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Téléphone (optionnel)</label>
            <input value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} className="input-field" placeholder="06 00 00 00 00" />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Message (optionnel)</label>
            <textarea value={form.message} onChange={e => setForm(p=>({...p,message:e.target.value}))} className="input-field h-20 resize-none" placeholder="Précisez l'objet de votre rendez-vous…" />
          </div>

          <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {submitting ? "Envoi en cours…" : "Confirmer le rendez-vous"}
          </button>
          <p className="text-xs text-center text-gray-400">
            Un email de confirmation vous sera envoyé ainsi qu&apos;un rappel 24h avant.
          </p>
        </div>
      )}
    </div>
  );
}
