import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { DateRangePicker } from '../assets/Data';
import { format } from 'date-fns';
import { Backend_URL } from '../assets/Data';
import { Separator } from '../components/ui/separator';
import { setLoading } from '../redux/slices/loaderSlice';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageRecords = () => {
    const [dateRange, setDateRange] = useState({ from: null, to: null });
    const [selectiveDateRange, setSelectiveDateRange] = useState({ from: null, to: null });
    const [minRecords, setMinRecords] = useState('');
    const [maxRecords, setMaxRecords] = useState('');
    const [resequenceYear, setResequenceYear] = useState('');
    const [resequenceInvoiceYear, setResequenceInvoiceYear] = useState('');
    const [isDeleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
    const [isSelectiveDeleteDialogOpen, setSelectiveDeleteDialogOpen] = useState(false);
    const [isResequenceDialogOpen, setResequenceDialogOpen] = useState(false);
    const [isResequenceInvoiceDialogOpen, setResequenceInvoiceDialogOpen] = useState(false);
    const { toast } = useToast();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.loader);
    const navigate = useNavigate();
    const handleDelete = async () => {
        if (!dateRange.from || !dateRange.to) {
            toast({
                title: "Error",
                description: "Please select a date range.",
                variant: "destructive",
            });
            return;
        }

        dispatch(setLoading(true));
        try {
            const response = await fetch(`${Backend_URL}/api/manage-records/delete-opd-records-by-date`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate: format(dateRange.from, 'yyyy-MM-dd'),
                    endDate: format(dateRange.to, 'yyyy-MM-dd'),
                }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An error occurred while deleting records.');
            }

            toast({
                title: "Success",
                description: data.message,
                variant: "success",
            });
            setDateRange({ from: null, to: null });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            dispatch(setLoading(false));
            setDeleteAllDialogOpen(false);
        }
    };

    const handleSelectiveDelete = async () => {
        if (!selectiveDateRange.from || !selectiveDateRange.to || !minRecords || !maxRecords) {
            toast({
                title: "Error",
                description: "Please fill all fields for selective delete.",
                variant: "destructive",
            });
            return;
        }
        if (parseInt(minRecords) > parseInt(maxRecords)) {
            toast({
                title: "Error",
                description: "Min records cannot be greater than max records.",
                variant: "destructive",
            });
            return;
        }

        dispatch(setLoading(true));
        try {
            const response = await fetch(`${Backend_URL}/api/manage-records/selective-delete-opd`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate: format(selectiveDateRange.from, 'yyyy-MM-dd'),
                    endDate: format(selectiveDateRange.to, 'yyyy-MM-dd'),
                    minRecords,
                    maxRecords,
                }),
                credentials: "include",
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'An error occurred during selective deletion.');
            }
            toast({
                title: "Success",
                description: data.message,
                variant: "success",
            });
            setSelectiveDateRange({ from: null, to: null });
            setMinRecords('');
            setMaxRecords('');
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            dispatch(setLoading(false));
            setSelectiveDeleteDialogOpen(false);
        }
    };

    const handleResequence = async () => {
        if (!resequenceYear) {
            toast({
                title: "Error",
                description: "Please enter a year to re-sequence.",
                variant: "destructive",
            });
            return;
        }

        dispatch(setLoading(true));
        try {
            const response = await fetch(`${Backend_URL}/api/manage-records/resequence-registration-numbers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ year: resequenceYear }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An error occurred while re-sequencing records.');
            }

            toast({
                title: "Success",
                description: data.message,
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            dispatch(setLoading(false));
            setResequenceDialogOpen(false);
        }
    };

    const handleResequenceInvoices = async () => {
        if (!resequenceInvoiceYear) {
            toast({
                title: "Error",
                description: "Please enter a year to re-sequence.",
                variant: "destructive",
            });
            return;
        }

        dispatch(setLoading(true));
        try {
            const response = await fetch(`${Backend_URL}/api/manage-records/resequence-service-bill-invoice-numbers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ year: resequenceInvoiceYear }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An error occurred while re-sequencing invoices.');
            }

            toast({
                title: "Success",
                description: data.message,
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            dispatch(setLoading(false));
            setResequenceInvoiceDialogOpen(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
                <Button
                    onClick={handleBack}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl sm:text-2xl font-bold">Manage Records</h1>
            </div>
            
                <div className="space-y-6">
                    <div className="p-4 border rounded-md">
                        <h3 className="text-lg font-semibold text-destructive">Delete All OPD Records in Date Range</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            This action is irreversible. All OPD visits, including their associated bills and payments, within the selected date range will be permanently deleted.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="w-full sm:w-auto">
                                <Label htmlFor="opd-date-range">Date Range</Label>
                                <DateRangePicker
                                    from={dateRange.from}
                                    to={dateRange.to}
                                    onSelect={(range) => setDateRange(range || { from: null, to: null })}
                                    onSearch={() => {}}
                                    onCancel={() => setDateRange({ from: null, to: null })}
                                />
                            </div>
                            <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={!dateRange.from || !dateRange.to}>
                                        Delete All Records in Range
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete all OPD records from{' '}
                                            <strong>{dateRange.from ? format(dateRange.from, 'PPP') : ''}</strong> to{' '}
                                            <strong>{dateRange.to ? format(dateRange.to, 'PPP') : ''}</strong>.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDelete();
                                            }}
                                            disabled={isLoading}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            {isLoading ? 'Deleting...' : 'Yes, delete records'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <Separator />

                    <div className="p-4 border rounded-md">
                        <h3 className="text-lg font-semibold text-destructive">Selectively Delete OPD Records</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            For each day in the date range, keep a random number of records between the min and max values, and delete the rest.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
                            <div className="w-full">
                                <Label htmlFor="selective-date-range">Date Range</Label>
                                <DateRangePicker
                                    from={selectiveDateRange.from}
                                    to={selectiveDateRange.to}
                                    onSelect={(range) => setSelectiveDateRange(range || { from: null, to: null })}
                                    onSearch={() => {}}
                                    onCancel={() => setSelectiveDateRange({ from: null, to: null })}
                                />
                            </div>
                            <div className="w-full ">
                                <Label htmlFor="min-records">Min Records to Keep</Label>
                                <Input id="min-records" type="number" placeholder="e.g., 20" value={minRecords} onChange={(e) => setMinRecords(e.target.value)} />
                            </div>
                            <div className="w-full">
                                <Label htmlFor="max-records">Max Records to Keep</Label>
                                <Input id="max-records" type="number" placeholder="e.g., 30" value={maxRecords} onChange={(e) => setMaxRecords(e.target.value)} />
                            </div>
                            <AlertDialog open={isSelectiveDeleteDialogOpen} onOpenChange={setSelectiveDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={!selectiveDateRange.from || !selectiveDateRange.to || !minRecords || !maxRecords}>
                                        Selectively Delete Records
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will selectively delete OPD records from{' '}
                                            <strong>{selectiveDateRange.from ? format(selectiveDateRange.from, 'PPP') : ''}</strong> to{' '}
                                            <strong>{selectiveDateRange.to ? format(selectiveDateRange.to, 'PPP') : ''}</strong>,
                                            keeping between <strong>{minRecords}</strong> and <strong>{maxRecords}</strong> records per day. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleSelectiveDelete();
                                            }}
                                            disabled={isLoading}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            {isLoading ? 'Deleting...' : 'Yes, proceed'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <Separator />

                    <div className="p-4 border rounded-md">
                        <h3 className="text-lg font-semibold text-blue-600">Re-sequence Patient Registration Numbers for a Specific Year</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            This action will re-sequence all patient registration numbers for the selected year to fill any gaps from deleted records. This process is irreversible.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="w-full sm:w-auto">
                                <Label htmlFor="resequence-year">Year</Label>
                                <Input
                                    id="resequence-year"
                                    type="number"
                                    placeholder={`e.g., ${new Date().getFullYear()}`}
                                    value={resequenceYear}
                                    onChange={(e) => setResequenceYear(e.target.value)}
                                />
                            </div>
                            <AlertDialog open={isResequenceDialogOpen} onOpenChange={setResequenceDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                        disabled={!resequenceYear}
                                    >
                                        Re-sequence Registration Numbers
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently re-sequence all patient registration numbers for the year <strong>{resequenceYear}</strong>. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleResequence();
                                            }}
                                            disabled={isLoading}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isLoading ? 'Processing...' : 'Yes, re-sequence now'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <Separator />

                    <div className="p-4 border rounded-md">
                        <h3 className="text-lg font-semibold text-purple-600">Re-sequence Service Bill Invoice Numbers</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            This action will re-sequence all service bill invoice numbers for the selected year to ensure they are consecutive. This process is irreversible.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="w-full sm:w-auto">
                                <Label htmlFor="resequence-invoice-year">Year</Label>
                                <Input
                                    id="resequence-invoice-year"
                                    type="number"
                                    placeholder={`e.g., ${new Date().getFullYear()}`}
                                    value={resequenceInvoiceYear}
                                    onChange={(e) => setResequenceInvoiceYear(e.target.value)}
                                />
                            </div>
                            <AlertDialog open={isResequenceInvoiceDialogOpen} onOpenChange={setResequenceInvoiceDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="text-purple-600 border-purple-600 hover:bg-purple-50"
                                        disabled={!resequenceInvoiceYear}
                                    >
                                        Re-sequence Invoice Numbers
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently re-sequence all service bill invoice numbers for the year <strong>{resequenceInvoiceYear}</strong>. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleResequenceInvoices();
                                            }}
                                            disabled={isLoading}
                                            className="bg-purple-600 hover:bg-purple-700"
                                        >
                                            {isLoading ? 'Processing...' : 'Yes, re-sequence now'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default ManageRecords; 