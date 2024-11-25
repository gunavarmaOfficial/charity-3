"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Users, Globe, Target, Award, Calendar } from "lucide-react";

const timeline = [
  {
    year: "1995",
    title: "Foundation Established",
    description: "Started with a small team of dedicated volunteers in Chennai.",
  },
  {
    year: "2000",
    title: "First Rural Project",
    description: "Launched our first rural education initiative in Tamil Nadu.",
  },
  {
    year: "2005",
    title: "Healthcare Program",
    description: "Established mobile healthcare units serving remote villages.",
  },
  {
    year: "2010",
    title: "Environmental Initiative",
    description: "Started large-scale tree plantation and conservation projects.",
  },
  {
    year: "2015",
    title: "Women Empowerment",
    description: "Launched comprehensive women empowerment programs.",
  },
  {
    year: "2020",
    title: "Digital Transformation",
    description: "Embraced technology to expand our reach and impact.",
  },
];

const team = [
  {
    name: "Dr. Rajesh Kumar",
    role: "Founder & Chairman",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    bio: "30+ years of experience in social work and community development.",
  },
  {
    name: "Priya Sharma",
    role: "Executive Director",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    bio: "Former corporate executive turned social entrepreneur.",
  },
  {
    name: "Dr. Anita Reddy",
    role: "Healthcare Director",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    bio: "Leading our healthcare initiatives across Tamil Nadu.",
  },
];

const awards = [
  "National Excellence Award in Social Service (2020)",
  "Best NGO in Education Sector (2019)",
  "Environmental Conservation Award (2018)",
  "Community Impact Award (2017)",
  "Women Empowerment Recognition (2016)",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1509099836639-18ba1795216d"
          alt="About Us"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-center text-white px-4 max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Our Story</h1>
          <p className="text-xl">
            Three decades of dedication to social transformation
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  Founded in 1995, Hope Foundation has been at the forefront of
                  social change in Tamil Nadu. Our mission is to create sustainable
                  solutions for communities in need through education, healthcare,
                  and empowerment initiatives.
                </p>
                <p>
                  We believe in the power of collective action and work closely
                  with communities to understand their needs and implement
                  effective solutions. Our approach combines grassroots
                  understanding with modern methodologies to create lasting impact.
                </p>
                <p>
                  Through our various programs, we have touched the lives of over
                  100,000 individuals across Tamil Nadu, creating positive change
                  that spans generations.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-[400px] rounded-lg overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
                alt="Our Mission"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A timeline of our major milestones and achievements
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary/20"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex items-center ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div className="w-1/2 pr-8 text-right">
                    <div
                      className={`${
                        index % 2 === 0 ? "text-right" : "text-left"
                      }`}
                    >
                      <h3 className="text-xl font-bold text-primary">
                        {item.year}
                      </h3>
                      <h4 className="font-semibold mb-2">{item.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center w-8 h-8">
                    <div className="h-4 w-4 rounded-full bg-primary"></div>
                  </div>
                  <div className="w-1/2 pl-8"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Our Leadership</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Meet the dedicated team behind our mission
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg"
              >
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-primary mb-4">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Recognition & Awards</h2>
            <p className="max-w-2xl mx-auto opacity-90">
              Our commitment to social change has been recognized by various
              organizations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {awards.map((award, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-4 bg-white/10 p-6 rounded-lg"
              >
                <Award className="w-8 h-8 flex-shrink-0" />
                <p className="text-lg">{award}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}