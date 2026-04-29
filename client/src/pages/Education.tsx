import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, Users, Download, Share2, Heart } from 'lucide-react';

/**
 * Prenatal Education & Provider Integration
 * Education resources, birth plan templates, and provider sharing
 */

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState('resources');
  const [selectedCategory, setSelectedCategory] = useState('general');

  // Mock education resources
  const resources = [
    {
      id: 1,
      title: 'Labor and Delivery Basics',
      category: 'labor',
      trimester: [2, 3],
      type: 'video',
      duration: '12 min',
      description: 'Understanding the stages of labor and what to expect',
    },
    {
      id: 2,
      title: 'Nutrition During Pregnancy',
      category: 'nutrition',
      trimester: [1, 2, 3],
      type: 'article',
      duration: '8 min read',
      description: 'Essential nutrients and healthy eating guidelines',
    },
    {
      id: 3,
      title: 'Partner Support Guide',
      category: 'partner',
      trimester: [2, 3],
      type: 'pdf',
      duration: '15 pages',
      description: 'How partners can best support during pregnancy and postpartum',
    },
    {
      id: 4,
      title: 'Postpartum Recovery',
      category: 'postpartum',
      trimester: [3],
      type: 'video',
      duration: '18 min',
      description: 'Physical and emotional recovery after delivery',
    },
  ];

  // Mock providers
  const providers = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'OB/GYN',
      location: 'New York, NY',
      rating: 4.9,
      reviews: 127,
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Psychiatrist',
      location: 'San Francisco, CA',
      rating: 4.8,
      reviews: 89,
    },
    {
      id: 3,
      name: 'Lisa Martinez',
      specialty: 'Lactation Consultant',
      location: 'Los Angeles, CA',
      rating: 4.95,
      reviews: 156,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prenatal Education & Providers</h1>
          <p className="text-gray-600 mt-2">Learn and connect with healthcare professionals</p>
        </div>
        <BookOpen className="w-12 h-12 text-purple-500" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="birthplan">Birth Plan</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        {/* RESOURCES TAB */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prenatal Education Hub</CardTitle>
              <CardDescription>Videos, articles, and guides for every stage of pregnancy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {['general', 'labor', 'nutrition', 'exercise', 'mental_health', 'partner', 'postpartum'].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat)}
                    className="capitalize"
                  >
                    {cat.replace('_', ' ')}
                  </Button>
                ))}
              </div>

              {/* Resources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources
                  .filter((r) => r.category === selectedCategory || selectedCategory === 'general')
                  .map((resource) => (
                    <Card key={resource.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{resource.title}</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded capitalize">
                            {resource.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                          <span>⏱️ {resource.duration}</span>
                          <span>Trimester {resource.trimester.join(', ')}</span>
                        </div>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">View Resource</Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BIRTH PLAN TAB */}
        <TabsContent value="birthplan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Birth Plan Template</CardTitle>
              <CardDescription>Create a personalized birth plan to share with your healthcare team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Labor Preferences */}
              <div>
                <h3 className="font-semibold mb-3">Labor Preferences</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Preferred Birth Location</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md">
                      <option>Hospital</option>
                      <option>Birthing Center</option>
                      <option>Home</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Labor Support (select all that apply)</label>
                    <div className="mt-2 space-y-2">
                      {['Partner', 'Doula', 'Family member', 'Midwife'].map((support) => (
                        <label key={support} className="flex items-center gap-2">
                          <input type="checkbox" />
                          <span>{support}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pain Management Preferences</label>
                    <div className="mt-2 space-y-2">
                      {['Natural/breathing', 'Epidural', 'IV pain medication', 'Nitrous oxide'].map((method) => (
                        <label key={method} className="flex items-center gap-2">
                          <input type="checkbox" />
                          <span>{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Preferences */}
              <div>
                <h3 className="font-semibold mb-3">Delivery Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Immediate skin-to-skin contact with baby</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Delayed cord clamping (1-3 minutes)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Avoid episiotomy if possible</span>
                  </label>
                </div>
              </div>

              {/* Postpartum Preferences */}
              <div>
                <h3 className="font-semibold mb-3">Postpartum Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Breastfeeding support</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Rooming-in (baby stays in room)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Limited visitors initially</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Save Birth Plan
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTS TAB */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate & Share Reports</CardTitle>
              <CardDescription>Create reports to share with your healthcare providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Report Options */}
              <div className="space-y-3">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">PPD Screening Report</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Generate a comprehensive postpartum depression screening report with your risk assessment and mood tracking data.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">Generate Report</Button>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Mood Tracking Summary</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Export your postpartum mood tracking data and trends for your healthcare provider.
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700">Generate Report</Button>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Birth Plan Summary</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Create a formatted birth plan document to discuss with your delivery team.
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700">Generate Report</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Share Report */}
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3">Share Report with Provider</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Provider Email</label>
                      <Input type="email" className="mt-1" placeholder="doctor@example.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Report Type</label>
                      <select className="w-full mt-1 px-3 py-2 border rounded-md">
                        <option>PPD Screening</option>
                        <option>Mood Tracking</option>
                        <option>Birth Plan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Access Expires In (days)</label>
                      <Input type="number" className="mt-1" defaultValue="7" />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROVIDERS TAB */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Find Healthcare Providers</CardTitle>
              <CardDescription>Connect with OB/GYNs, therapists, and other pregnancy specialists</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search & Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Search providers..." />
                <select className="px-3 py-2 border rounded-md">
                  <option>All Specialties</option>
                  <option>OB/GYN</option>
                  <option>Psychiatrist</option>
                  <option>Therapist</option>
                  <option>Midwife</option>
                  <option>Lactation Consultant</option>
                </select>
              </div>

              {/* Providers List */}
              <div className="space-y-3">
                {providers.map((provider) => (
                  <Card key={provider.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{provider.name}</h4>
                          <p className="text-sm text-gray-600">{provider.specialty}</p>
                          <p className="text-sm text-gray-500">{provider.location}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold">{provider.rating}</span>
                          </div>
                          <p className="text-xs text-gray-600">{provider.reviews} reviews</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">View Profile</Button>
                        <Button variant="outline" className="flex-1">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
