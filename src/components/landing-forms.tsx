import { useState } from "react";
import { CalendarCheck, CheckCircle2, Mail, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const services = [
  "استشارة تجارية",
  "إنشاء موقع جديد",
  "ربط بوابات الدفع",
  "الاشتراكات والفوترة",
  "دعم فني",
  "أخرى",
];

const timeSlots = ["صباحًا (9-12)", "ظهرًا (12-16)", "مساءً (16-20)"];

type RequestType = "appointment" | "message";

interface AppointmentState {
  name: string;
  phone: string;
  email: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
}

interface MessageState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const emptyAppointment: AppointmentState = {
  name: "",
  phone: "",
  email: "",
  service: "",
  preferred_date: "",
  preferred_time: "",
  notes: "",
};

const emptyMessage: MessageState = { name: "", email: "", subject: "", message: "" };

async function submitRequest(payload: Record<string, unknown>) {
  const { error } = await supabase.from("appointment_requests").insert(payload);
  if (error) throw error;
}

export function LandingForms() {
  const [appointment, setAppointment] = useState<AppointmentState>(emptyAppointment);
  const [message, setMessage] = useState<MessageState>(emptyMessage);
  const [sendingAppointment, setSendingAppointment] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [appointmentSent, setAppointmentSent] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  async function handleAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!appointment.name.trim() || !appointment.phone.trim()) {
      toast.error("يرجى إدخال الاسم ورقم الهاتف");
      return;
    }
    setSendingAppointment(true);
    try {
      await submitRequest({
        request_type: "appointment",
        name: appointment.name.trim(),
        phone: appointment.phone.trim(),
        email: appointment.email.trim() || null,
        service: appointment.service || null,
        preferred_date: appointment.preferred_date || null,
        preferred_time: appointment.preferred_time || null,
        message: appointment.notes.trim() || null,
      });
      setAppointmentSent(true);
      setAppointment(emptyAppointment);
      toast.success("تم إرسال طلب الموعد بنجاح، سنتواصل معك قريبًا");
    } catch {
      toast.error("تعذّر إرسال الطلب، حاول مرة أخرى");
    } finally {
      setSendingAppointment(false);
    }
  }

  async function handleMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.name.trim() || !message.email.trim() || !message.message.trim()) {
      toast.error("يرجى إدخال الاسم والبريد والرسالة");
      return;
    }
    setSendingMessage(true);
    try {
      await submitRequest({
        request_type: "message",
        name: message.name.trim(),
        email: message.email.trim(),
        message: message.message.trim(),
        service: message.subject.trim() || null,
      });
      setMessageSent(true);
      setMessage(emptyMessage);
      toast.success("تم إرسال رسالتك بنجاح");
    } catch {
      toast.error("تعذّر إرسال الرسالة، حاول مرة أخرى");
    } finally {
      setSendingMessage(false);
    }
  }

  return (
    <section id="forms" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">احجز موعدًا أو راسلنا</h2>
          <p className="mt-2 text-muted-foreground">
            املأ النموذج المناسب وسيتواصل معك فريق HN Groupe في أقرب وقت
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Appointment booking form */}
          <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">حجز موعد</CardTitle>
                  <CardDescription>اختر الخدمة والوقت المناسب لك</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentSent ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                  <p className="font-semibold">تم استلام طلب الموعد!</p>
                  <p className="text-sm text-muted-foreground">
                    سنتواصل معك لتأكيد الموعد.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setAppointmentSent(false)}>
                    حجز موعد آخر
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleAppointment} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ap-name">الاسم الكامل *</Label>
                      <Input
                        id="ap-name"
                        value={appointment.name}
                        onChange={(e) => setAppointment({ ...appointment, name: e.target.value })}
                        placeholder="محمد أحمد"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ap-phone">رقم الهاتف *</Label>
                      <div className="relative">
                        <Phone className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="ap-phone"
                          type="tel"
                          value={appointment.phone}
                          onChange={(e) => setAppointment({ ...appointment, phone: e.target.value })}
                          placeholder="06xxxxxxxx"
                          className="pe-9"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ap-email">البريد الإلكتروني</Label>
                    <Input
                      id="ap-email"
                      type="email"
                      value={appointment.email}
                      onChange={(e) => setAppointment({ ...appointment, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الخدمة</Label>
                    <Select
                      value={appointment.service}
                      onValueChange={(v) => setAppointment({ ...appointment, service: v })}
                      dir="rtl"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="اختر الخدمة" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ap-date">التاريخ المفضل</Label>
                      <Input
                        id="ap-date"
                        type="date"
                        value={appointment.preferred_date}
                        onChange={(e) =>
                          setAppointment({ ...appointment, preferred_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الوقت المفضل</Label>
                      <Select
                        value={appointment.preferred_time}
                        onValueChange={(v) => setAppointment({ ...appointment, preferred_time: v })}
                        dir="rtl"
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر الوقت" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ap-notes">ملاحظات</Label>
                    <Textarea
                      id="ap-notes"
                      value={appointment.notes}
                      onChange={(e) => setAppointment({ ...appointment, notes: e.target.value })}
                      placeholder="أخبرنا بتفاصيل طلبك..."
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={sendingAppointment}>
                    <CalendarCheck className="h-4 w-4" />
                    {sendingAppointment ? "جارٍ الإرسال..." : "تأكيد حجز الموعد"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact message form */}
          <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">أرسل رسالة</CardTitle>
                  <CardDescription>لأي استفسار أو اقتراح، راسلنا مباشرة</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {messageSent ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                  <p className="font-semibold">تم استلام رسالتك!</p>
                  <p className="text-sm text-muted-foreground">سنرد عليك عبر بريدك الإلكتروني.</p>
                  <Button variant="outline" size="sm" onClick={() => setMessageSent(false)}>
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMessage} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="msg-name">الاسم *</Label>
                      <Input
                        id="msg-name"
                        value={message.name}
                        onChange={(e) => setMessage({ ...message, name: e.target.value })}
                        placeholder="اسمك"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="msg-email">البريد الإلكتروني *</Label>
                      <Input
                        id="msg-email"
                        type="email"
                        value={message.email}
                        onChange={(e) => setMessage({ ...message, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="msg-subject">الموضوع</Label>
                    <Input
                      id="msg-subject"
                      value={message.subject}
                      onChange={(e) => setMessage({ ...message, subject: e.target.value })}
                      placeholder="موضوع الرسالة"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="msg-body">الرسالة *</Label>
                    <Textarea
                      id="msg-body"
                      value={message.message}
                      onChange={(e) => setMessage({ ...message, message: e.target.value })}
                      placeholder="اكتب رسالتك هنا..."
                      rows={7}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={sendingMessage}>
                    <Send className="h-4 w-4" />
                    {sendingMessage ? "جارٍ الإرسال..." : "إرسال الرسالة"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
