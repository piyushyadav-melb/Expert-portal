"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpertStats } from "@/service/profile.service";
import { Loader2, Users, Video, Calendar } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Stats {
  bookings: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  meetings: {
    total: number;
    active: number;
    ended: number;
  };
}

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getExpertStats();
        if (response.status) {
          setStats(response.data);
        } else {
          toast.error(response.message || "Failed to fetch statistics");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to fetch statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500">No statistics available</div>
    );
  }

  const cards = [
    {
      title: "Total Bookings",
      value: stats.bookings.total,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Completed Bookings",
      value: stats.bookings.completed,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Meetings",
      value: stats.meetings.total,
      icon: Video,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Ended Meetings",
      value: stats.meetings.ended,
      icon: Video,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link href="/bookings">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              View Bookings
            </Button>
          </Link>
          <Link href="/meetings">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              View Meetings
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Booking Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-semibold">{stats.bookings.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold">
                  {stats.bookings.completed}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cancelled</span>
                <span className="font-semibold">
                  {stats.bookings.cancelled}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meeting Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active</span>
                <span className="font-semibold">{stats.meetings.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ended</span>
                <span className="font-semibold">{stats.meetings.ended}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
