import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Terms = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-10">
            <Link to="/login">
                <img src={logo} alt="Clothing Inventory System" className="w-72 mb-8" />
            </Link>

            <div className="w-full max-w-3xl bg-white border border-gray-300 rounded shadow-sm p-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms &amp; Privacy Policy</h1>
                <p className="text-sm text-gray-500 mb-8">Last updated: 25 May 2026</p>

                <section className="space-y-6 text-sm text-gray-700 leading-6">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
                        <p>
                            By creating an account or using the Clothing Inventory System, you agree to
                            these terms. If you do not agree, please do not use the service.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-2">2. Use of the Service</h2>
                        <p>
                            The service is provided for managing clothing inventory, including
                            products, categories, brands, and stock levels. You are responsible for
                            the accuracy of the data you enter and for keeping your account
                            credentials secure.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-2">3. User Accounts</h2>
                        <p>
                            You must provide accurate information when registering. You may not share
                            your account with others. Admin accounts have additional privileges and
                            must be assigned only to authorised personnel.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-2">4. Data &amp; Privacy</h2>
                        <p>
                            We store the personal information you provide (name, email) and the
                            inventory data you enter. Data is used only to operate the service. We do
                            not sell your data to third parties. You may request deletion of your
                            account at any time.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-2">5. Inventory Records</h2>
                        <p>
                            Inventory adjustments are recorded with a reference and the user who made
                            the change. These audit records are retained for accountability and may
                            be reviewed by administrators.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-2">6. Changes to These Terms</h2>
                        <p>
                            We may update these terms from time to time. Continued use of the service
                            after changes constitutes acceptance of the updated terms.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-2">7. Contact</h2>
                        <p>
                            For questions about these terms or your data, please contact the system
                            administrator.
                        </p>
                    </div>
                </section>

                <div className="mt-10 flex justify-end">
                    <Link
                        to="/register"
                        className="text-sm text-blue-700 font-semibold hover:underline"
                    >
                        ← Back to Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Terms;
