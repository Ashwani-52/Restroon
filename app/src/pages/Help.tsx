import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LifeBuoy, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const Help: React.FC = () => {
    const handleSubmitTicket = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = (document.getElementById('subject') as HTMLInputElement).value;
        const message = (document.getElementById('message') as HTMLTextAreaElement).value;

        const mailtoLink = `mailto:ashwanikumar6064@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;

        toast.success('Opening your email client to send the request.');
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Help & Support</h2>
                <p className="text-muted-foreground">Find answers to common questions or reach out to our team.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Contact Options */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Contact Us</CardTitle>
                        <CardDescription>Need immediate assistance?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-semibold text-sm">Email Support</p>
                                <p className="text-sm text-muted-foreground">ashwanikumar6064@gmail.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-semibold text-sm">Live Chat</p>
                                <p className="text-sm text-muted-foreground">Available 9 AM - 6 PM</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <LifeBuoy className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-semibold text-sm">Help Center</p>
                                <p className="text-sm text-muted-foreground">help.ordersmartly.com</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Ticket Form */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Submit a Ticket</CardTitle>
                        <CardDescription>Describe your issue and we'll reply via email.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmitTicket} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="What do you need help with?" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Provide as much detail as possible..."
                                    className="min-h-[120px]"
                                    required
                                />
                            </div>
                            <Button type="submit">Submit Request</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* FAQ */}
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Quick answers to common questions about Restroon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How do I connect my bank account?</AccordionTrigger>
                            <AccordionContent>
                                You can connect your bank account by navigating to the Dashboard, clicking on your Café profile in the sidebar, and updating the Payment Details section.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>When are payouts processed?</AccordionTrigger>
                            <AccordionContent>
                                Payouts are processed automatically every Tuesday and Friday for orders completed in the previous cycle. It usually takes 1-2 business days to reflect in your bank account.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>How do I handle refunds?</AccordionTrigger>
                            <AccordionContent>
                                Refunds can be initiated from the Orders page. Click on a specific order, and if it's eligible, you will see a 'Refund Order' button. Refunds take 5-7 business days to process for the customer.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>I forgot my password, how do I reset it?</AccordionTrigger>
                            <AccordionContent>
                                On the login page, click the 'Forgot Password' link. Enter your registered email address, and we will send you a secure link to reset your password.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
};

export default Help;
