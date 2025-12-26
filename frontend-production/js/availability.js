/**
 * Dynamic Availability Loader - Santos Cleaning Solutions
 * Fetches real availability from N8N automation
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        availabilityUrl: 'https://n8n.williamjj.com/webhook/laura-agenda',
        textElementId: 'availability-text',
        slotsElementId: 'availability-slots',
        badgeId: 'availability-indicator',
        fallbackMessage: 'Real-time availability from our calendar',
        maxSlotsToShow: 3
    };

    /**
     * Format a slot from the new summary_for_laura format
     * Input: { label: "Sat 12/27", available_periods: ["all_day"] }
     * Output: "Sat 12/27 • All Day"
     */
    function formatSlotFromSummary(slot) {
        const label = slot.label || '';
        const periods = slot.available_periods || [];

        // Format period text
        let periodText = '';
        if (periods.includes('all_day')) {
            periodText = 'All Day';
        } else if (periods.includes('morning') && periods.includes('afternoon')) {
            periodText = 'All Day';
        } else if (periods.includes('morning')) {
            periodText = 'Morning';
        } else if (periods.includes('afternoon')) {
            periodText = 'Afternoon';
        } else if (periods.length > 0) {
            periodText = periods[0].charAt(0).toUpperCase() + periods[0].slice(1);
        }

        return periodText ? `${label} • ${periodText}` : label;
    }

    /**
     * Format a slot string for display (legacy format)
     * Input: "Sat 12/13 — Morning & Afternoon (All day free)"
     * Output: "Sat 12/13 - Morning"
     */
    function formatSlot(slotString) {
        // Extract day and time period
        const parts = slotString.split('—');
        if (parts.length >= 2) {
            const day = parts[0].trim();
            let time = parts[1].trim();

            // Simplify the time description
            if (time.toLowerCase().includes('morning')) {
                time = 'Morning';
            } else if (time.toLowerCase().includes('afternoon')) {
                time = 'Afternoon';
            } else if (time.toLowerCase().includes('all day')) {
                time = 'All Day';
            }

            return `${day} • ${time}`;
        }
        return slotString.split('—')[0].trim();
    }

    async function fetchAvailability() {
        const textElement = document.getElementById(CONFIG.textElementId);
        const slotsElement = document.getElementById(CONFIG.slotsElementId);
        const badgeElement = document.getElementById(CONFIG.badgeId);

        if (!slotsElement) return;

        try {
            const response = await fetch(CONFIG.availabilityUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ request: 'availability' })
            });

            if (response.ok) {
                const data = await response.json();
                let isUrgent = false;
                let slotsHTML = '';
                let noteText = CONFIG.fallbackMessage;

                // NEW FORMAT: Handle summary_for_laura[] array from N8N
                if (data.summary_for_laura && Array.isArray(data.summary_for_laura) && data.summary_for_laura.length > 0) {
                    const slotsCount = data.summary_for_laura.length;

                    // Create slot items for the first N slots
                    const slotsToShow = data.summary_for_laura.slice(0, CONFIG.maxSlotsToShow);
                    slotsHTML = slotsToShow.map(slot => {
                        const formatted = formatSlotFromSummary(slot);
                        return `<span class="slot-item"><i class="fas fa-check"></i> ${formatted}</span>`;
                    }).join('');

                    // Add "more" indicator if there are more slots
                    if (slotsCount > CONFIG.maxSlotsToShow) {
                        slotsHTML += `<span class="slot-item">+${slotsCount - CONFIG.maxSlotsToShow} more</span>`;
                    }

                    // Set note text based on availability
                    if (slotsCount <= 3) {
                        noteText = `⚡ Limited availability - only ${slotsCount} slots this week!`;
                        isUrgent = true;
                    } else {
                        noteText = `✓ ${slotsCount} slots available this week - Book now!`;
                    }
                }
                // LEGACY FORMAT: Handle available[] array (backward compatibility)
                else if (data.available && Array.isArray(data.available) && data.available.length > 0) {
                    const slotsCount = data.available.length;

                    // Create slot items for the first N slots
                    const slotsToShow = data.available.slice(0, CONFIG.maxSlotsToShow);
                    slotsHTML = slotsToShow.map(slot => {
                        const formatted = formatSlot(slot);
                        return `<span class="slot-item"><i class="fas fa-check"></i> ${formatted}</span>`;
                    }).join('');

                    // Add "more" indicator if there are more slots
                    if (slotsCount > CONFIG.maxSlotsToShow) {
                        slotsHTML += `<span class="slot-item">+${slotsCount - CONFIG.maxSlotsToShow} more</span>`;
                    }

                    // Set note text based on availability
                    if (slotsCount <= 3) {
                        noteText = `⚡ Limited availability - only ${slotsCount} slots this week!`;
                        isUrgent = true;
                    } else {
                        noteText = `✓ ${slotsCount} slots available this week - Book now!`;
                    }
                } else {
                    // Fallback display
                    slotsHTML = '<span class="slot-item"><i class="fas fa-calendar"></i> Same-Day Available</span>';
                    noteText = 'Call or request a quote for real-time availability';
                }

                // Update the DOM
                slotsElement.innerHTML = slotsHTML;
                if (textElement) {
                    textElement.textContent = noteText;
                }

                // Add urgency styling if needed
                if (badgeElement && isUrgent) {
                    badgeElement.classList.add('urgency-high');
                }

                // Track availability view
                if (typeof gtag !== 'undefined') {
                    const slotsAvailable = data.summary_for_laura ? data.summary_for_laura.length :
                        (data.available ? data.available.length : 0);
                    const nextSlot = data.summary_for_laura ? data.summary_for_laura[0]?.label :
                        (data.available ? data.available[0] : 'unknown');
                    gtag('event', 'availability_view', {
                        'event_category': 'engagement',
                        'slots_available': slotsAvailable,
                        'next_available': nextSlot
                    });
                }

                console.log('📅 Availability loaded:', data);
            } else {
                throw new Error('Failed to fetch availability');
            }
        } catch (error) {
            console.warn('⚠️ Availability fetch failed, using fallback:', error.message);
            if (slotsElement) {
                slotsElement.innerHTML = '<span class="slot-item"><i class="fas fa-calendar"></i> Same-Day Available</span>';
            }
            if (textElement) {
                textElement.textContent = 'Call for real-time availability';
            }
        }
    }

    // Initial load
    document.addEventListener('DOMContentLoaded', function () {
        // Small delay to prioritize other content loading
        setTimeout(fetchAvailability, 500);
    });

    // Export for manual refresh if needed
    window.refreshAvailability = fetchAvailability;
})();
