import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Divider,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  CreditCard,
  Security,
  CalendarToday,
  Person,
  Receipt,
  CheckCircle,
  Error
} from '@mui/icons-material';

function PaymentModal({ 
  open, 
  onClose, 
  onPaymentSuccess, 
  paymentDetails,
  loading = false 
}) {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Portugal'
    }
  });
  
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentResult, setPaymentResult] = useState(null);

  // Função para calcular preço baseado na energia estimada
  const calculatePrice = () => {
    if (!paymentDetails?.estimatedEnergy) return 0;
    
    // Extrair número da string de energia (ex: "15.5 kWh" -> 15.5)
    const energyMatch = paymentDetails.estimatedEnergy.match(/(\d+\.?\d*)/);
    const energyValue = energyMatch ? parseFloat(energyMatch[1]) : 0;
    
    // Se for em Wh, converter para kWh
    const isWh = paymentDetails.estimatedEnergy.includes('Wh') && !paymentDetails.estimatedEnergy.includes('kWh');
    const energyInKwh = isWh ? energyValue / 1000 : energyValue;
    
    // Preço por kWh (simulado - 0.25€ por kWh)
    const pricePerKwh = 0.25;
    const totalPrice = energyInKwh * pricePerKwh;
    
    return Math.max(totalPrice, 0.50); // Mínimo de 0.50€
  };

  const formatPrice = (price) => {
    return `€${price.toFixed(2)}`;
  };

  // Validação de campos
  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
      newErrors.cardNumber = 'Valid card number required';
    }
    
    if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Valid expiry date required (MM/YY)';
    }
    
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      newErrors.cvv = 'Valid CVV required';
    }
    
    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para formatar número do cartão
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Função para formatar data de expiração
  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Processo de pagamento simulado
  const processPayment = async () => {
    if (!validateForm()) return;
    
    setProcessing(true);
    setPaymentResult(null);
    
    try {
      const paymentPayload = {
        amount: calculatePrice(),
        currency: 'EUR',
        cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv,
        cardholderName: paymentData.cardholderName,
        description: `Charging booking - ${paymentDetails?.station || 'Station'}`,
        bookingDetails: {
          stationId: paymentDetails?.stationId,
          duration: paymentDetails?.duration,
          estimatedEnergy: paymentDetails?.estimatedEnergy,
          startTime: paymentDetails?.startTime
        }
      };

      console.log('Processing payment:', paymentPayload);

      const response = await fetch('http://192.168.160.7:8089/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setPaymentResult({
          success: true,
          transactionId: result.transactionId,
          amount: result.amount,
          status: result.status
        });
        
        // Aguardar um pouco para mostrar o sucesso antes de continuar
        setTimeout(() => {
          onPaymentSuccess({
            transactionId: result.transactionId,
            amount: result.amount,
            paymentMethod: `****${paymentData.cardNumber.slice(-4)}`,
            status: result.status
          });
        }, 2000);
        
      } else {
        setPaymentResult({
          success: false,
          error: result.error || 'UNKNOWN_ERROR',
          message: result.message || 'Payment failed. Please try again.'
        });
      }
      
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentResult({
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Connection error. Please check your internet connection and try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleClose = () => {
    if (!processing) {
      onClose();
      // Reset form após fechar
      setTimeout(() => {
        setPaymentData({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardholderName: '',
          billingAddress: {
            street: '',
            city: '',
            postalCode: '',
            country: 'Portugal'
          }
        });
        setErrors({});
        setPaymentResult(null);
      }, 300);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={processing}
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCard color="primary" />
          Payment Details
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          
          {/* Resumo da Reserva */}
          <Paper sx={{ p: 3, backgroundColor: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Receipt color="primary" />
              Booking Summary
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
              <Typography variant="body2">
                <strong>Station:</strong> {paymentDetails?.station || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Duration:</strong> {paymentDetails?.duration || 'N/A'} minutes
              </Typography>
              <Typography variant="body2">
                <strong>Est. Energy:</strong> {paymentDetails?.estimatedEnergy || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Start Time:</strong> {paymentDetails?.startTime || 'N/A'}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total Amount:</Typography>
              <Chip 
                label={formatPrice(calculatePrice())} 
                color="primary" 
                sx={{ fontSize: '1.1rem', fontWeight: 'bold', px: 2, py: 1 }}
              />
            </Box>
          </Paper>

          {/* Resultado do Pagamento */}
          {paymentResult && (
            <Alert 
              severity={paymentResult.success ? 'success' : 'error'}
              icon={paymentResult.success ? <CheckCircle /> : <Error />}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
              </Typography>
              <Typography variant="body2">
                {paymentResult.success 
                  ? `Transaction ID: ${paymentResult.transactionId}`
                  : paymentResult.message
                }
              </Typography>
            </Alert>
          )}

          {/* Formulário de Pagamento */}
          {!paymentResult?.success && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Card Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Card Number"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                  error={!!errors.cardNumber}
                  helperText={errors.cardNumber || 'Use 4000000000000002 to simulate declined card'}
                  fullWidth
                  inputProps={{ maxLength: 19 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCard />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    error={!!errors.expiryDate}
                    helperText={errors.expiryDate}
                    inputProps={{ maxLength: 5 }}
                    sx={{ flex: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    label="CVV"
                    type="password"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                    error={!!errors.cvv}
                    helperText={errors.cvv}
                    inputProps={{ maxLength: 4 }}
                    sx={{ flex: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Security />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                
                <TextField
                  label="Cardholder Name"
                  value={paymentData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  error={!!errors.cardholderName}
                  helperText={errors.cardholderName}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  💳 Test Cards: <br/>
                  • 4111111111111111 - Success <br/>
                  • 4000000000000002 - Declined <br/>
                  • 4000000000000119 - Processing Error
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={processing}
          size="large"
        >
          Cancel
        </Button>
        
        {!paymentResult?.success && (
          <Button 
            onClick={processPayment}
            variant="contained" 
            disabled={processing}
            size="large"
            sx={{ minWidth: 120 }}
          >
            {processing ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Processing...
              </Box>
            ) : (
              `Pay ${formatPrice(calculatePrice())}`
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default PaymentModal;