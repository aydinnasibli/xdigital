'use client';
import React, { useState } from 'react';
import { ArrowRight, Sparkles, Zap, Target, Rocket, TrendingUp, Globe, Star, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const HomePage = () => {
  const [email, setEmail] = useState('');

  const services = [
    {
      icon: Globe,
      title: "Veb-sayt Yaradılması",
      description: "Müasir və responsive dizaynlarla biznesinizi onlayn dünyaya gətirin",
      color: "from-amber-100 to-orange-100",
      link: "/website"
    },
    {
      icon: TrendingUp,
      title: "Sosial Media İdarəetməsi",
      description: "Brendinizi sosial mediyada böyüdün və geniş auditoriyaya çatın",
      color: "from-rose-100 to-pink-100",
      link: "/smma"
    },
    {
      icon: Sparkles,
      title: "Gələcək Xidmətlər",
      description: "Yeni həllər və konsaltinq xidmətləri tezliklə sizinlə",
      color: "from-emerald-100 to-teal-100",
      link: "#future"
    }
  ];

  const process = [
    { icon: Target, title: "Planlaşdır", desc: "Məqsəd və strategiyanızı müəyyənləşdirin" },
    { icon: Zap, title: "Qur", desc: "Layihəni yaradıb həyata keçirin" },
    { icon: Rocket, title: "Burax", desc: "Məhsulu uğurla istifadəyə verin" },
    { icon: TrendingUp, title: "Optimallaşdır", desc: "Performansı təkmilləşdirin" }
  ];

  const templates = [
    { name: "Modern Biznes", category: "Korporativ", color: "bg-gradient-to-br from-amber-50 to-orange-50" },
    { name: "E-ticarət Pro", category: "Mağaza", color: "bg-gradient-to-br from-rose-50 to-pink-50" },
    { name: "Portfolio Plus", category: "Şəxsi", color: "bg-gradient-to-br from-emerald-50 to-teal-50" },
    { name: "Startup Hub", category: "Texnologiya", color: "bg-gradient-to-br from-blue-50 to-cyan-50" },
    { name: "Kreativ Agency", category: "Agentlik", color: "bg-gradient-to-br from-amber-50 to-yellow-50" },
    { name: "Restoran Menyu", category: "Qida", color: "bg-gradient-to-br from-orange-50 to-red-50" }
  ];

  const testimonials = [
    { name: "Elvin Məmmədov", company: "Tech Startup", text: "Veb-saytımız sayəsində müştəri bazamız 300% artdı. Əla komanda!", rating: 5 },
    { name: "Günel Həsənova", company: "Fashion Brand", text: "Sosial media strategiyası bizə real nəticələr gətirdi. Təşəkkür edirəm!", rating: 5 },
    { name: "Rəşad Əliyev", company: "Local Business", text: "Professional yanaşma və sürətli xidmət. Hamıya tövsiyə edirəm.", rating: 5 }
  ];

  const plans = [
    {
      name: "Başlanğıc",
      price: "₼199",
      period: "/ay",
      features: ["5 səhifəlik veb-sayt", "Əsas SEO", "Mobil uyğunlaşma", "1 ay texniki dəstək"],
      popular: false
    },
    {
      name: "Biznes",
      price: "₼499",
      period: "/ay",
      features: ["15 səhifəlik veb-sayt", "Qabaqcıl SEO", "E-ticarət inteqrasiyası", "3 ay texniki dəstək", "Sosial media inteqrasiyası"],
      popular: true
    },
    {
      name: "Premium",
      price: "₼999",
      period: "/ay",
      features: ["Limitsiz səhifələr", "Fərdi dizayn", "Tam SEO paketi", "12 ay texniki dəstək", "SMMA paketi", "Analitika və hesabatlar"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-amber-100 rounded-full mb-8 border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span className="text-sm font-medium text-amber-900">İddialı Bizneslər üçün Rəqəmsal Həllər</span>
            </div>

            <h1 className="text-7xl md:text-8xl font-bold mb-8 text-slate-900 leading-tight tracking-tight">
              Biznesinizi Onlayn
              <br />
              <span className="text-amber-600">Dünyada</span> Böyüdün
            </h1>

            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Veb-sayt yaradılması, sosial media idarəetməsi və rəqəmsal böyümə — hamısı bir yerdə
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-10 py-7 text-lg font-medium">
                Xidmətləri Kəşf Et
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-full px-10 py-7 text-lg font-medium">
                Başla
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-24">
            {[
              { number: "500+", label: "Layihə" },
              { number: "98%", label: "Məmnuniyyət" },
              { number: "50+", label: "Şirkət" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 rounded-3xl bg-white border border-slate-200">
                <div className="text-4xl font-bold text-slate-900">{stat.number}</div>
                <div className="text-sm text-slate-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
              Xidmətlərimiz
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Biznesinizi böyütməyə kömək edən hərtərəfli rəqəmsal həllər
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <Card key={i} className="border border-slate-200 hover:border-slate-300 transition-colors bg-white group">
                <CardContent className="p-10">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${service.color} p-5 mb-8`}>
                    <service.icon className="w-full h-full text-slate-700" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">{service.title}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed text-lg">{service.description}</p>
                  <Button variant="ghost" className="p-0 h-auto font-semibold text-slate-900 hover:text-slate-700 text-lg">
                    Ətraflı
                    <ArrowUpRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
              Necə İşləyirik
            </h2>
            <p className="text-xl text-slate-600">
              Sadə və effektiv 4 addımda uğura gedən yol
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-12">
            {process.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 rounded-full bg-amber-100 border-2 border-amber-200 p-6">
                    <step.icon className="w-full h-full text-amber-700" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">{step.title}</h3>
                <p className="text-slate-600 text-lg">{step.desc}</p>
                {i < process.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
              Hazır Şablonlar
            </h2>
            <p className="text-xl text-slate-600 mb-6">
              Peşəkar dizaynlarla dəqiqələr içində başlayın
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {templates.map((template, i) => (
              <div
                key={i}
                className={`${template.color} border border-slate-200 rounded-3xl p-10 h-56 cursor-pointer hover:border-slate-300 transition-colors`}
              >
                <span className="inline-block px-4 py-2 bg-white rounded-full text-sm font-semibold text-slate-700 mb-4 border border-slate-200">
                  {template.category}
                </span>
                <h3 className="text-3xl font-bold text-slate-900">{template.name}</h3>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-10 py-7 text-lg font-medium">
              Bütün Şablonlara Baxın
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
              Müştərilərimiz Nə Deyir
            </h2>
            <p className="text-xl text-slate-600">
              Uğur hekayələri və rəylər
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="border border-slate-200 bg-[#faf8f5]">
                <CardContent className="p-10">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-8 leading-relaxed text-lg">"{testimonial.text}"</p>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">{testimonial.name}</div>
                    <div className="text-slate-600">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Future Services Teaser */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-[3rem] p-16 text-center text-white border border-amber-600">
            <Sparkles className="w-20 h-20 mx-auto mb-8" />
            <h2 className="text-5xl font-bold mb-6">Yeni Xidmətlər Yolda</h2>
            <p className="text-2xl mb-12 text-amber-50">
              AI əsaslı həllər, avtomatlaşdırma və daha çoxu tezliklə...
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <Input
                type="email"
                placeholder="Email ünvanınız"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 backdrop-blur border-white/40 text-white placeholder:text-white/80 rounded-full h-14 px-6 text-lg"
              />
              <Button className="bg-white text-amber-700 hover:bg-amber-50 rounded-full px-8 font-semibold text-lg h-14">
                Xəbər Al
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
              Qiymətləndirmə Planları
            </h2>
            <p className="text-xl text-slate-600">
              Hər büdcəyə uyğun paket seçimləri
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div key={i} className="relative">
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-8 py-3 rounded-full text-sm font-bold border-2 border-amber-600">
                    Ən Populyar
                  </div>
                )}
                <Card className={`border-2 ${plan.popular ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                  <CardContent className="p-10">
                    <h3 className="text-3xl font-bold mb-3 text-slate-900">{plan.name}</h3>
                    <div className="flex items-baseline mb-8">
                      <span className="text-6xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-600 ml-3 text-xl">{plan.period}</span>
                    </div>
                    <ul className="space-y-5 mb-10">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-lg">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full rounded-full h-14 text-lg font-semibold ${plan.popular
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200'}`}
                    >
                      Seç
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;