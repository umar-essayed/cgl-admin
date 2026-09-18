import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { requireAuth } from '@/lib/apiAuth';

export async function GET() {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const db = getAdminFirestore();

    const [projectsSnap, equipmentSnap, newsSnap, partnersSnap, rfqsSnap, settingsDoc] = await Promise.all([
      db.collection('projects').get(),
      db.collection('equipment').get(),
      db.collection('news').get(),
      db.collection('partners').get(),
      db.collection('rfq_requests').get(),
      db.collection('settings').doc('company_info').get()
    ]);

    const newRfqsCount = rfqsSnap.docs.filter(d => d.data().status === 'new').length;
    const settings = settingsDoc.exists ? settingsDoc.data() : null;

    // Recent 5 RFQs
    const recentRfqs = rfqsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 5);

    // Category breakdown for equipment
    const equipmentCategories: Record<string, number> = {};
    equipmentSnap.docs.forEach(doc => {
      const cat = doc.data().category || 'other';
      equipmentCategories[cat] = (equipmentCategories[cat] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProjects: projectsSnap.size,
        totalEquipment: equipmentSnap.size,
        totalNews: newsSnap.size,
        totalPartners: partnersSnap.size,
        totalRfqs: rfqsSnap.size,
        newRfqsCount,
        equipmentCategories,
        recentRfqs,
        companyStats: settings?.stats || { globalPartners: 650, innovativeSolutions: 300, yearsOfGrowth: 20 },
        firestoreConnected: true,
        lastChecked: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
