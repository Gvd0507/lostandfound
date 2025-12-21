import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { getMyMatches, answerSecretQuestion } from '../services/api';
import { formatDate, getStatusColor } from '../utils/helpers';
import { useNotifications } from '../context/NotificationContext';
import CelebrationPopup from '../components/CelebrationPopup';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [answer, setAnswer] = useState('');
  const [verifyError, setVerifyError] = useState(null);
  const [verifySuccess, setVerifySuccess] = useState(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const { markAllNotificationsAsRead } = useNotifications();

  useEffect(() => {
    fetchMatches();
    // Mark all notifications as read when viewing matches page
    markAllNotificationsAsRead();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await getMyMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!answer.trim()) {
      setVerifyError('Please provide an answer');
      return;
    }

    try {
      const response = await answerSecretQuestion(selectedMatch.id, answer);
      
      // Check if verification was successful
      if (response.verified) {
        setShowCelebration(true);
        setVerifySuccess('Match verified successfully! The owner will be notified.');
      } else {
        setVerifySuccess('Answer submitted successfully! You will be notified of the result.');
      }
      
      setSelectedMatch(null);
      setAnswer('');
      setVerifyError(null);
      setAttemptsRemaining(null);
      fetchMatches();
    } catch (error) {
      const errorData = error.response?.data;
      setVerifyError(errorData?.message || 'Verification failed');
      
      // Update attempts remaining if provided
      if (typeof errorData?.attemptsRemaining === 'number') {
        setAttemptsRemaining(errorData.attemptsRemaining);
      }
    }
  };

  const handleClose = () => {
    setSelectedMatch(null);
    setAnswer('');
    setVerifyError(null);
    setAttemptsRemaining(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Matches
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Items that our AI has matched with your reports
        </Typography>

        {verifySuccess && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setVerifySuccess(null)}>
            {verifySuccess}
          </Alert>
        )}

        {loading ? (
          <Typography align="center">Loading matches...</Typography>
        ) : matches.length === 0 ? (
          <Typography align="center" color="text.secondary">
            No matches found yet. Keep checking back!
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {matches.map((match) => (
              <Grid item xs={12} md={6} key={match.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        Match Found!
                      </Typography>
                      <Chip
                        label={match.status}
                        color={getStatusColor(match.status)}
                        size="small"
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Your Report:
                        </Typography>
                        {match.yourItem.imageUrl && (
                          <CardMedia
                            component="img"
                            height="120"
                            image={match.yourItem.imageUrl}
                            alt={match.yourItem.itemName}
                            sx={{ borderRadius: 1, mb: 1 }}
                          />
                        )}
                        <Typography variant="body2" fontWeight="bold">
                          {match.yourItem.itemName}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {match.yourItem.category}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Matched With:
                        </Typography>
                        {match.matchedItem.imageUrl && (
                          <CardMedia
                            component="img"
                            height="120"
                            image={match.matchedItem.imageUrl}
                            alt={match.matchedItem.itemName}
                            sx={{ borderRadius: 1, mb: 1 }}
                          />
                        )}
                        <Typography variant="body2" fontWeight="bold">
                          {match.matchedItem.itemName}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {match.matchedItem.category}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Match Score: {(match.matchScore * 100).toFixed(0)}%
                      </Typography>
                      <Typography variant="caption" display="block">
                        Matched on: {formatDate(match.matchedAt)}
                      </Typography>
                    </Box>

                    {/* Show where to find for lost item owners */}
                    {match.whereToFind && match.yourItem.type === 'lost' && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          📍 Where to collect: {match.whereToFind}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          The finder will verify ownership before you can collect your item.
                        </Typography>
                      </Alert>
                    )}

                    {match.status === 'matched' && match.requiresVerification && (
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => setSelectedMatch(match)}
                      >
                        Verify Ownership
                      </Button>
                    )}

                    {match.status === 'verified' && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Verified! Contact details have been shared.
                        {match.whereToFind && (
                          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                            Where to find: {match.whereToFind}
                          </Typography>
                        )}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Verification Dialog */}
      <Dialog open={Boolean(selectedMatch)} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Verify Ownership</DialogTitle>
        <DialogContent>
          {verifyError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {verifyError}
              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Attempts remaining: {attemptsRemaining}
                </Typography>
              )}
            </Alert>
          )}
          
          {selectedMatch?.secretQuestion ? (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="info.dark" sx={{ fontWeight: 'bold', mb: 1 }}>
                Security Question:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedMatch.secretQuestion}
              </Typography>
            </Box>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No security question available for this match.
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Your Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            multiline
            rows={3}
            placeholder="Enter your answer to verify ownership"
            disabled={attemptsRemaining === 0}
          />
          {attemptsRemaining === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Maximum attempts exceeded. This case has been sent for admin review.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleVerify} 
            variant="contained"
            disabled={attemptsRemaining === 0}
          >
            Submit Answer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Celebration Popup */}
      <CelebrationPopup 
        open={showCelebration} 
        onClose={() => setShowCelebration(false)}
      />
    </Container>
  );
};

export default MatchesPage;
